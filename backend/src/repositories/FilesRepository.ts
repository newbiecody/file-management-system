import { pool } from "../db/pools";
import { FileMetadata, FileMetadataStatus } from "../types/files/FileMetadata";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { isDefined } from "../utils";

interface FindAllFilesParams {
  page: number | null;
  pageSize: number | null;
  parentId: string | null;
  search: string;
  fileStatus: FileMetadataStatus;
}

export interface CreateFileInput {
  parentId?: number | null;
  name: string;
  size?: number | null;
  mimetype?: string | null;
  objectType: "FILE" | "FOLDER";
  storageKey?: string;
}

export interface UpdateFileInput {
  name: string;
  size: number | null;
  mimetype: string | null;
  parentId: number | null;
  storageKey: string;
  status?: FileMetadataStatus;
}

export class FileRepository {
  async findAll(
    params: Partial<FindAllFilesParams> = {}
  ): Promise<{ data: FileMetadata[]; total: number }> {
    const { page = 1, pageSize = 20, parentId, search, fileStatus } = params;

    const where: string[] = [];
    const values: any[] = [];

    if (parentId !== undefined) {
      where.push(`parentId ${parentId === null ? "IS NULL" : "= ?"}`);
      if (parentId !== null) values.push(parentId);
    }

    if (search) {
      where.push(`name LIKE ?`);
      values.push(`%${search}%`);
    }

    if (fileStatus) {
      where.push("status = ?");
      values.push(fileStatus);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

    const offset = !(page && pageSize) ? 0 : (page - 1) * pageSize;

    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        parentId,
        id,
        name,
        size,
        mimetype,
        objectType,
        storageKey,
        createdAt,
        updatedAt,
        status
      FROM files
      ${whereClause}
      ORDER BY createdAt DESC
      LIMIT ? OFFSET ?
      `,
      [...values, pageSize, offset]
    );

    const [countRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT COUNT(*) as total
      FROM files
      ${whereClause}
      `,
      values
    );

    return {
      data: rows as FileMetadata[],
      total: countRows[0].total,
    };
  }

  async findByExactName(name: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM files WHERE name = ? ORDER BY createdAt DESC LIMIT 1`,
      [name]
    );

    return rows.length === 0 ? null : (rows[0] as FileMetadata);
  }

  async create(input: CreateFileInput) {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        `
        INSERT INTO files (
          parentId,
          name,
          size,
          mimetype,
          objectType,
          storageKey
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          input.parentId ?? null,
          input.name,
          input.size ?? null,
          input.mimetype ?? null,
          input.objectType,
          input.storageKey,
        ]
      );

      const id = result.insertId;

      const [rows] = await pool.query<RowDataPacket[]>(
        `
        SELECT
          parentId,
          id,
          name,
          size,
          mimetype,
          objectType,
          storageKey,
          createdAt,
          updatedAt,
          status
        FROM files
        WHERE id = ?
        `,
        [id]
      );
      return rows[0] as FileMetadata;
    } catch (e: any) {
      if (e.code === "ER_NO_REFERENCED_ROW_2") {
        throw new Error(
          `Parent folder with id ${input.parentId} does not exist`
        );
      }
      throw e;
    }
  }

  async findById(id: number) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        parentId,
        id,
        name,
        size,
        mimetype,
        objectType,
        storageKey,
        createdAt,
        updatedAt,
        status
      FROM files
      WHERE id = ?
      `,
      [id]
    );

    return rows[0] ? (rows[0] as FileMetadata) : null;
  }

  async update(id: number, input: Partial<UpdateFileInput>) {
    const fields: string[] = [];
    const values: any[] = [];

    if (isDefined(input.name)) {
      fields.push("name = ?");
      values.push(input.name);
    }

    if (isDefined(input.size)) {
      fields.push("size = ?");
      values.push(input.size);
    }

    if (isDefined(input.mimetype)) {
      fields.push("mimetype = ?");
      values.push(input.mimetype);
    }

    if (isDefined(input.parentId)) {
      fields.push("parentId = ?");
      values.push(input.parentId);
    }

    if (isDefined(input.storageKey)) {
      fields.push("storageKey = ?");
      values.push(input.storageKey);
    }

    if (isDefined(input.status)) {
      fields.push("status = ?");
      values.push(input.status);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    await pool.execute<ResultSetHeader>(
      `
      UPDATE files
      SET ${fields.join(", ")}
      WHERE id = ?
      `,
      [...values, id]
    );

    return this.findById(id);
  }

  async softDelete(id: number) {
    await this.update(id, { status: "SOFT_DELETED" });
  }

  async createFolder(parentId: number | null, fileName: string) {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        `
        INSERT INTO files (
          parentId,
          name,
          objectType
        )
        VALUES (?, ?, ?)
        `,
        [parentId ?? null, fileName, "FOLDER"]
      );

      const id = result.insertId;

      const [rows] = await pool.query<RowDataPacket[]>(
        `
        SELECT
          parentId,
          id,
          name,
          objectType,
          createdAt,
          updatedAt,
          status
        FROM files
        WHERE id = ?
        `,
        [id]
      );
      return rows[0] as FileMetadata;
    } catch (e: any) {
      if (e.code === "ER_NO_REFERENCED_ROW_2") {
        throw new Error(`Parent folder with id ${parentId} does not exist`);
      }
      throw e;
    }
  }
}

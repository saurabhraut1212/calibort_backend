import { Request, Response } from "express";
import { ok, fail } from "../utils/response";
import { importReqresPage } from "../services/importServices";

export async function importReqresHandler(req: Request, res: Response): Promise<Response> {
  try {
    const pageParam = req.query.page;
    const page = Number(pageParam ?? 1);
    if (Number.isNaN(page) || page < 1) return res.status(400).json(fail("Invalid page"));
    const result = await importReqresPage(page);
    return res.json(ok(`Imported page ${result.page}`, { imported: result.imported }));
  } catch (err) {
    return res.status(500).json(fail((err as Error).message));
  }
}

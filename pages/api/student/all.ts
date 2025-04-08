import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import StudentBiodata from '@/models/studentbiodata';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const students = await StudentBiodata.find().sort({ createdAt: -1 });
  res.status(200).json(JSON.parse(JSON.stringify(students)));
}

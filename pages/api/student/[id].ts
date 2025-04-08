import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import StudentBiodata, { IStudentBiodata } from '../../../models/studentbiodata'; // Adjust path to your model
import dbConnect from '../../../lib/dbConnect'; // Adjust path to your MongoDB connection utility

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query; // Get the student ID from the URL
  const { method } = req;

  // Connect to MongoDB
  await dbConnect();

  switch (method) {
    case 'PUT':
      try {
        // Validate the ID
        if (!mongoose.Types.ObjectId.isValid(id as string)) {
          return res.status(400).json({ message: 'Invalid student ID' });
        }

        // Extract the updated data from the request body
        const updatedData: Partial<IStudentBiodata> = req.body;

        // Update the student document in the database
        const updatedStudent = await StudentBiodata.findByIdAndUpdate(
          id,
          { $set: updatedData },
          { new: true, runValidators: true } // Return the updated document and run schema validators
        );

        if (!updatedStudent) {
          return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json(updatedStudent);
      } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ message: 'Error updating student', error });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT']);
      res.status(405).json({ message: `Method ${method} not allowed` });
      break;
  }
}
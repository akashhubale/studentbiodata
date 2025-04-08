import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/dbConnect';
import StudentBiodata from '../../models/studentbiodata';
import formidable, { Fields, Files } from 'formidable';

// Disable Next.js body parsing for this route
export const config = {
  api: {
    bodyParser: false, // We’ll handle parsing manually
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // Parse the incoming multipart/form-data
    const form = formidable({ multiples: true });
    const [fields]: [Fields, Files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Log parsed fields for debugging
    console.log('Parsed formData:', fields);

    // Since fields can be arrays (formidable behavior), take the first value
    const formData = {
      name: Array.isArray(fields.name) ? fields.name[0] : fields.name,
      sectionAndRollNo: Array.isArray(fields.sectionAndRollNo) ? fields.sectionAndRollNo[0] : fields.sectionAndRollNo,
      branch: Array.isArray(fields.branch) ? fields.branch[0] : fields.branch,
      dateOfBirth: Array.isArray(fields.dateOfBirth) ? fields.dateOfBirth[0] : fields.dateOfBirth,
      fatherName: Array.isArray(fields.fatherName) ? fields.fatherName[0] : fields.fatherName,
      fatherOccupation: Array.isArray(fields.fatherOccupation) ? fields.fatherOccupation[0] : fields.fatherOccupation,
      permanentAddress: Array.isArray(fields.permanentAddress) ? fields.permanentAddress[0] : fields.permanentAddress,
      fatherPhoneOffice: Array.isArray(fields.fatherPhoneOffice) ? fields.fatherPhoneOffice[0] : fields.fatherPhoneOffice,
      residencePhone: Array.isArray(fields.residencePhone) ? fields.residencePhone[0] : fields.residencePhone,
      studentMobile: Array.isArray(fields.studentMobile) ? fields.studentMobile[0] : fields.studentMobile,
      fatherMobile: Array.isArray(fields.fatherMobile) ? fields.fatherMobile[0] : fields.fatherMobile,
      motherMobile: Array.isArray(fields.motherMobile) ? fields.motherMobile[0] : fields.motherMobile,
      fatherOfficeAddress: Array.isArray(fields.fatherOfficeAddress) ? fields.fatherOfficeAddress[0] : fields.fatherOfficeAddress,
      studentEmail: Array.isArray(fields.studentEmail) ? fields.studentEmail[0] : fields.studentEmail,
      fatherEmail: Array.isArray(fields.fatherEmail) ? fields.fatherEmail[0] : fields.fatherEmail,
      hostelName: Array.isArray(fields.hostelName) ? fields.hostelName[0] : fields.hostelName,
      hostelWardenName: Array.isArray(fields.hostelWardenName) ? fields.hostelWardenName[0] : fields.hostelWardenName,
      hostelPhone: Array.isArray(fields.hostelPhone) ? fields.hostelPhone[0] : fields.hostelPhone,
      hostelWardenPhone: Array.isArray(fields.hostelWardenPhone) ? fields.hostelWardenPhone[0] : fields.hostelWardenPhone,
      roommates: Array.isArray(fields.roommates) ? fields.roommates[0] : fields.roommates,
      localGuardian: Array.isArray(fields.localGuardian) ? fields.localGuardian[0] : fields.localGuardian,
      localGuardianAddressPhone: Array.isArray(fields.localGuardianAddressPhone) ? fields.localGuardianAddressPhone[0] : fields.localGuardianAddressPhone,
      outstandingFees: Array.isArray(fields.outstandingFees) ? fields.outstandingFees[0] : fields.outstandingFees,
      pendingDocuments: Array.isArray(fields.pendingDocuments) ? fields.pendingDocuments[0] : fields.pendingDocuments,
      profSociety: Array.isArray(fields.profSociety) ? fields.profSociety[0] : fields.profSociety,
      studentStatus: Array.isArray(fields.studentStatus) ? fields.studentStatus[0] : fields.studentStatus,
      fifthTermProgress: Array.isArray(fields.fifthTermProgress) ? fields.fifthTermProgress[0] : fields.fifthTermProgress,
      sixthTermProgress: Array.isArray(fields.sixthTermProgress) ? fields.sixthTermProgress[0] : fields.sixthTermProgress,
      academicRecords: Array.isArray(fields.academicRecords) ? fields.academicRecords[0] : fields.academicRecords,
      projectDetails: Array.isArray(fields.projectDetails) ? fields.projectDetails[0] : fields.projectDetails,
      participation: Array.isArray(fields.participation) ? fields.participation[0] : fields.participation,
      phoneDiary: Array.isArray(fields.phoneDiary) ? fields.phoneDiary[0] : fields.phoneDiary,
      parentsVisit: Array.isArray(fields.parentsVisit) ? fields.parentsVisit[0] : fields.parentsVisit,
      imageUrl: Array.isArray(fields.imageUrl) ? fields.imageUrl[0] : fields.imageUrl,
    };

    // Validate required fields
    if (!formData.name?.trim() || !formData.sectionAndRollNo?.trim() || !formData.branch?.trim() || !formData.dateOfBirth?.trim() || !formData.imageUrl?.trim()) {
      console.log('Validation failed. Missing fields:', {
        name: formData.name,
        sectionAndRollNo: formData.sectionAndRollNo,
        branch: formData.branch,
        dateOfBirth: formData.dateOfBirth,
        imageUrl: formData.imageUrl,
      });
      return res.status(400).json({ message: 'Missing required fields: name, sectionAndRollNo, branch, dateOfBirth, and imageUrl are required' });
    }

    // Safe parsing helper with generic type
    const safeParse = <T>(value: string | undefined, defaultValue: T): T => {
      if (!value || typeof value !== 'string') return defaultValue;
      try {
        return JSON.parse(value) as T;
      } catch (error: unknown) {
        console.error(`Failed to parse ${value}:`, (error as Error).message);
        return defaultValue;
      }
    };

    const parsedData = {
      name: formData.name,
      sectionAndRollNo: formData.sectionAndRollNo,
      branch: formData.branch,
      dateOfBirth: formData.dateOfBirth,
      fatherName: formData.fatherName || '',
      fatherOccupation: formData.fatherOccupation || '',
      permanentAddress: formData.permanentAddress || '',
      fatherPhoneOffice: formData.fatherPhoneOffice || '',
      residencePhone: formData.residencePhone || '',
      studentMobile: formData.studentMobile || '',
      fatherMobile: formData.fatherMobile || '',
      motherMobile: formData.motherMobile || '',
      fatherOfficeAddress: formData.fatherOfficeAddress || '',
      studentEmail: formData.studentEmail || '',
      fatherEmail: formData.fatherEmail || '',
      hostelName: formData.hostelName || '',
      hostelWardenName: formData.hostelWardenName || '',
      hostelPhone: formData.hostelPhone || '',
      hostelWardenPhone: formData.hostelWardenPhone || '',
      roommates: formData.roommates || '',
      localGuardian: formData.localGuardian || '',
      localGuardianAddressPhone: formData.localGuardianAddressPhone || '',
      outstandingFees: formData.outstandingFees || '',
      pendingDocuments: formData.pendingDocuments || '',
      profSociety: formData.profSociety || '',
      studentStatus: formData.studentStatus || '',
      fifthTermProgress: safeParse(formData.fifthTermProgress, { jul: '', aug: '', sept: '', oct: '' }),
      sixthTermProgress: safeParse(formData.sixthTermProgress, { jan: '', feb: '', mar: '', apr: '' }),
      academicRecords: safeParse(formData.academicRecords, {
        termVII: { result: '', details: '', sgpa: '', cgpa: '' },
        termVIII: { result: '', details: '', sgpa: '', cgpa: '' },
      }),
      projectDetails: safeParse(formData.projectDetails, [{ sem: '', date: '', status: '', remark: '' }]),
      participation: safeParse(formData.participation, [{ sem: '', eventName: '', eventPlace: '', level: '', date: '' }]),
      phoneDiary: safeParse(formData.phoneDiary, [{ date: '', mobile: '', reason: '' }]),
      parentsVisit: safeParse(formData.parentsVisit, [{ date: '', parentName: '', remark: '', detention: '' }]),
      imageUrl: formData.imageUrl,
    };

    const studentBiodata = new StudentBiodata(parsedData);
    await studentBiodata.save();

    res.status(201).json({ message: 'Student biodata saved successfully', data: studentBiodata });
  } catch (error: unknown) { // Line 138: Already 'unknown', ensuring no 'any'
    console.error('Error saving student biodata:', (error as Error).message);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
}
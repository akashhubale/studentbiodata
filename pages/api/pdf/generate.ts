import { NextApiRequest, NextApiResponse } from 'next';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import dbConnect from '@/lib/dbConnect';
import StudentBiodata from '@/models/studentbiodata';

// Define types from your schema for array elements
interface ProjectDetail {
  sem?: string;
  date?: string;
  status?: string;
  remark?: string;
}

interface Participation {
  sem?: string;
  eventName?: string;
  eventPlace?: string;
  level?: string;
  date?: string;
}

interface PhoneDiaryEntry {
  date?: string;
  mobile?: string;
  reason?: string;
}

interface ParentVisit {
  date?: string;
  parentName?: string;
  remark?: string;
  detention?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'Missing or invalid ids in request body' });
  }

  try {
    console.log('Starting PDF generation...');
    console.time('Total execution time');

    console.log('Connecting to database...');
    await dbConnect();
    console.log('Database connected');

    const students = await StudentBiodata.find({ _id: { $in: ids } }).lean();
    if (!students || students.length === 0) {
      return res.status(404).json({ message: 'No students found' });
    }

    console.log('Students found:', students.length);

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    for (const student of students) {
      let page = pdfDoc.addPage([612, 792]); // Use let instead of const
      console.log(`Processing student: ${student.name}`);

      const drawText = (text: string, x: number, y: number, size = 10, isBold = false) => {
        page.drawText(text || 'N/A', { x, y, size, font: isBold ? boldFont : font, color: rgb(0, 0, 0) });
      };

      let y = 750;

      // Basic Info
      drawText('Basic Information', 50, y, 12, true);
      y -= 20;
      drawText(`Name: ${student.name}`, 50, y, 10);
      y -= 15;
      drawText(`Section & Roll No: ${student.sectionAndRollNo}`, 50, y, 10);
      y -= 15;
      drawText(`Branch: ${student.branch}`, 50, y, 10);
      y -= 15;
      drawText(`Date of Birth: ${student.dateOfBirth}`, 50, y, 10);
      y -= 15;
      drawText(`Student Email: ${student.studentEmail}`, 50, y, 10);
      y -= 15;
      drawText(`Student Mobile: ${student.studentMobile}`, 50, y, 10);
      y -= 20;

      // Family Info
      drawText('Family Information', 50, y, 12, true);
      y -= 20;
      drawText(`Father's Name: ${student.fatherName}`, 50, y, 10);
      y -= 15;
      drawText(`Father's Occupation: ${student.fatherOccupation}`, 50, y, 10);
      y -= 15;
      drawText(`Permanent Address: ${student.permanentAddress}`, 50, y, 10);
      y -= 15;
      drawText(`Father's Office Phone: ${student.fatherPhoneOffice}`, 50, y, 10);
      y -= 15;
      drawText(`Residence Phone: ${student.residencePhone}`, 50, y, 10);
      y -= 15;
      drawText(`Father's Mobile: ${student.fatherMobile}`, 50, y, 10);
      y -= 15;
      drawText(`Mother's Mobile: ${student.motherMobile}`, 50, y, 10);
      y -= 15;
      drawText(`Father's Office Address: ${student.fatherOfficeAddress}`, 50, y, 10);
      y -= 15;
      drawText(`Father's Email: ${student.fatherEmail}`, 50, y, 10);
      y -= 20;

      // Hostel Info
      drawText('Hostel Information', 50, y, 12, true);
      y -= 20;
      drawText(`Hostel Name: ${student.hostelName}`, 50, y, 10);
      y -= 15;
      drawText(`Hostel Warden Name: ${student.hostelWardenName}`, 50, y, 10);
      y -= 15;
      drawText(`Hostel Phone: ${student.hostelPhone}`, 50, y, 10);
      y -= 15;
      drawText(`Hostel Warden Phone: ${student.hostelWardenPhone}`, 50, y, 10);
      y -= 15;
      drawText(`Roommates: ${student.roommates}`, 50, y, 10);
      y -= 20;

      // Guardian Info
      drawText('Local Guardian', 50, y, 12, true);
      y -= 20;
      drawText(`Local Guardian: ${student.localGuardian}`, 50, y, 10);
      y -= 15;
      drawText(`Address & Phone: ${student.localGuardianAddressPhone}`, 50, y, 10);
      y -= 20;

      // Administrative Info
      drawText('Administrative Details', 50, y, 12, true);
      y -= 20;
      drawText(`Outstanding Fees: ${student.outstandingFees}`, 50, y, 10);
      y -= 15;
      drawText(`Pending Documents: ${student.pendingDocuments}`, 50, y, 10);
      y -= 15;
      drawText(`Professional Society: ${student.profSociety}`, 50, y, 10);
      y -= 15;
      drawText(`Student Status: ${student.studentStatus}`, 50, y, 10);

      // Add more pages if needed
      if (y < 100) {
        page = pdfDoc.addPage([612, 792]);
        y = 750;
      }

      // Fifth Term Progress
      drawText('Fifth Term Progress', 50, y, 12, true);
      y -= 20;
      if (student.fifthTermProgress) {
        drawText(`July: ${student.fifthTermProgress.jul}`, 50, y, 10);
        y -= 15;
        drawText(`August: ${student.fifthTermProgress.aug}`, 50, y, 10);
        y -= 15;
        drawText(`September: ${student.fifthTermProgress.sept}`, 50, y, 10);
        y -= 15;
        drawText(`October: ${student.fifthTermProgress.oct}`, 50, y, 10);
        y -= 20;
      }

      // Sixth Term Progress
      drawText('Sixth Term Progress', 50, y, 12, true);
      y -= 20;
      if (student.sixthTermProgress) {
        drawText(`January: ${student.sixthTermProgress.jan}`, 50, y, 10);
        y -= 15;
        drawText(`February: ${student.sixthTermProgress.feb}`, 50, y, 10);
        y -= 15;
        drawText(`March: ${student.sixthTermProgress.mar}`, 50, y, 10);
        y -= 15;
        drawText(`April: ${student.sixthTermProgress.apr}`, 50, y, 10);
        y -= 20;
      }

      // Academic Records
      drawText('Academic Records', 50, y, 12, true);
      y -= 20;
      if (student.academicRecords) {
        if (student.academicRecords.termVII) {
          drawText('Term VII', 50, y, 10, true);
          y -= 15;
          drawText(`Result: ${student.academicRecords.termVII.result}`, 50, y, 10);
          y -= 15;
          drawText(`Details: ${student.academicRecords.termVII.details}`, 50, y, 10);
          y -= 15;
          drawText(`SGPA: ${student.academicRecords.termVII.sgpa}`, 50, y, 10);
          y -= 15;
          drawText(`CGPA: ${student.academicRecords.termVII.cgpa}`, 50, y, 10);
          y -= 20;
        }
        if (student.academicRecords.termVIII) {
          drawText('Term VIII', 50, y, 10, true);
          y -= 15;
          drawText(`Result: ${student.academicRecords.termVIII.result}`, 50, y, 10);
          y -= 15;
          drawText(`Details: ${student.academicRecords.termVIII.details}`, 50, y, 10);
          y -= 15;
          drawText(`SGPA: ${student.academicRecords.termVIII.sgpa}`, 50, y, 10);
          y -= 15;
          drawText(`CGPA: ${student.academicRecords.termVIII.cgpa}`, 50, y, 10);
          y -= 20;
        }
      }

      // Project Details
      if (student.projectDetails && student.projectDetails.length > 0) {
        if (y < 100) {
          page = pdfDoc.addPage([612, 792]);
          y = 750;
        }
        drawText('Project Details', 50, y, 12, true);
        y -= 20;
        student.projectDetails.forEach((project: ProjectDetail, index: number) => {
          drawText(`Project ${index + 1}`, 50, y, 10, true);
          y -= 15;
          drawText(`Semester: ${project.sem}`, 50, y, 10);
          y -= 15;
          drawText(`Date: ${project.date}`, 50, y, 10);
          y -= 15;
          drawText(`Status: ${project.status}`, 50, y, 10);
          y -= 15;
          drawText(`Remark: ${project.remark}`, 50, y, 10);
          y -= 20;
          if (y < 100 && index < student.projectDetails.length - 1) {
            page = pdfDoc.addPage([612, 792]);
            y = 750;
          }
        });
      }

      // Participation
      if (student.participation && student.participation.length > 0) {
        if (y < 100) {
          page = pdfDoc.addPage([612, 792]);
          y = 750;
        }
        drawText('Participation', 50, y, 12, true);
        y -= 20;
        student.participation.forEach((event: Participation, index: number) => {
          drawText(`Event ${index + 1}`, 50, y, 10, true);
          y -= 15;
          drawText(`Semester: ${event.sem}`, 50, y, 10);
          y -= 15;
          drawText(`Event Name: ${event.eventName}`, 50, y, 10);
          y -= 15;
          drawText(`Place: ${event.eventPlace}`, 50, y, 10);
          y -= 15;
          drawText(`Level: ${event.level}`, 50, y, 10);
          y -= 15;
          drawText(`Date: ${event.date}`, 50, y, 10);
          y -= 20;
          if (y < 100 && index < student.participation.length - 1) {
            page = pdfDoc.addPage([612, 792]);
            y = 750;
          }
        });
      }

      // Phone Diary
      if (student.phoneDiary && student.phoneDiary.length > 0) {
        if (y < 100) {
          page = pdfDoc.addPage([612, 792]);
          y = 750;
        }
        drawText('Phone Diary', 50, y, 12, true);
        y -= 20;
        student.phoneDiary.forEach((entry: PhoneDiaryEntry, index: number) => {
          drawText(`Entry ${index + 1}`, 50, y, 10, true);
          y -= 15;
          drawText(`Date: ${entry.date}`, 50, y, 10);
          y -= 15;
          drawText(`Mobile: ${entry.mobile}`, 50, y, 10);
          y -= 15;
          drawText(`Reason: ${entry.reason}`, 50, y, 10);
          y -= 20;
          if (y < 100 && index < student.phoneDiary.length - 1) {
            page = pdfDoc.addPage([612, 792]);
            y = 750;
          }
        });
      }

      // Parents Visit
      if (student.parentsVisit && student.parentsVisit.length > 0) {
        if (y < 100) {
          page = pdfDoc.addPage([612, 792]);
          y = 750;
        }
        drawText('Parents Visit', 50, y, 12, true);
        y -= 20;
        student.parentsVisit.forEach((visit: ParentVisit, index: number) => {
          drawText(`Visit ${index + 1}`, 50, y, 10, true);
          y -= 15;
          drawText(`Date: ${visit.date}`, 50, y, 10);
          y -= 15;
          drawText(`Parent Name: ${visit.parentName}`, 50, y, 10);
          y -= 15;
          drawText(`Remark: ${visit.remark}`, 50, y, 10);
          y -= 15;
          drawText(`Detention: ${visit.detention}`, 50, y, 10);
          y -= 20;
          if (y < 100 && index < student.parentsVisit.length - 1) {
            page = pdfDoc.addPage([612, 792]);
            y = 750;
          }
        });
      }

      // Metadata
      if (student.imageUrl) {
        drawText(`Image URL: ${student.imageUrl}`, 50, y, 10);
        y -= 15;
      }
      drawText(`Created At: ${new Date(student.createdAt).toLocaleString()}`, 50, y, 10);
    }

    console.log('Saving PDF document...');
    const pdfBytes = await pdfDoc.save();
    console.log('PDF bytes generated, size:', pdfBytes.length);
    console.log('PDF header sample:', pdfBytes.slice(0, 10).toString()); // Expect 25504446
    console.log('PDF tail sample:', pdfBytes.slice(-10).toString()); // Expect 2525454f46

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="students_${Date.now()}.pdf"`);
    res.setHeader('Content-Length', pdfBytes.length.toString());
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Encoding', 'identity');
    console.log('Sending response with size:', pdfBytes.length);

    res.status(200).send(Buffer.from(pdfBytes));
    console.timeEnd('Total execution time');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('PDF generation error:', errorMessage);
    res.status(500).json({ message: 'Internal Server Error', error: errorMessage });
  }
}
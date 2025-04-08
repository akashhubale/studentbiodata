import { NextApiRequest, NextApiResponse } from 'next';
import { PDFDocument, rgb, StandardFonts, PDFPage } from 'pdf-lib';
import path from 'path';
import fs from 'fs/promises';
import dbConnect from '@/lib/dbConnect';
import StudentBiodata from '@/models/studentbiodata';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'Missing or invalid ids in request body' });
  }

  try {
    await dbConnect();

    const students = await StudentBiodata.find({ _id: { $in: ids } });
    if (!students || students.length === 0) {
      return res.status(404).json({ message: 'No students found' });
    }

    console.log('Students found:', students.length);

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    for (const [index, student] of students.entries()) {
      const page = pdfDoc.addPage([612, 792]); // US Letter size
      console.log(`Processing student ${index + 1}: ${student.name}`);
      console.log('Page dimensions:', { width: page.getWidth(), height: page.getHeight() });

      const drawText = (text: string, x: number, y: number, size = 10) => {
        page.drawText(text || 'N/A', {
          x,
          y,
          size,
          font,
          color: rgb(0, 0, 0),
        });
      };

      // Draw student data
      drawText(`Name: ${student.name}`, 50, 750, 12);
      drawText(`Section & Roll No: ${student.sectionAndRollNo}`, 50, 730, 10);
      drawText(`Branch: ${student.branch}`, 50, 710, 10);
      drawText(`Date of Birth: ${student.dateOfBirth}`, 50, 690, 10);
      drawText(`Father's Name: ${student.fatherName}`, 50, 670, 10);
      drawText(`Father's Occupation: ${student.fatherOccupation}`, 50, 650, 10);
      drawText(`Permanent Address: ${student.permanentAddress}`, 50, 630, 10);
      drawText(`Father's Office Phone: ${student.fatherPhoneOffice}`, 50, 610, 10);
      drawText(`Residence Phone: ${student.residencePhone}`, 50, 590, 10);
      drawText(`Student Mobile: ${student.studentMobile}`, 50, 570, 10);
      drawText(`Father's Mobile: ${student.fatherMobile}`, 50, 550, 10);
      drawText(`Mother's Mobile: ${student.motherMobile}`, 50, 530, 10);
      drawText(`Father's Office Address: ${student.fatherOfficeAddress}`, 50, 510, 10);
      drawText(`Student Email: ${student.studentEmail}`, 50, 490, 10);
      drawText(`Father's Email: ${student.fatherEmail}`, 50, 470, 10);
      drawText(`Hostel Name: ${student.hostelName}`, 50, 450, 10);
      drawText(`Hostel Warden Name: ${student.hostelWardenName}`, 50, 430, 10);
      drawText(`Hostel Phone: ${student.hostelPhone}`, 50, 410, 10);
      drawText(`Hostel Warden Phone: ${student.hostelWardenPhone}`, 50, 390, 10);
      drawText(`Roommates: ${student.roommates}`, 50, 370, 10);
      drawText(`Local Guardian: ${student.localGuardian}`, 50, 350, 10);
      drawText(`Local Guardian Address & Phone: ${student.localGuardianAddressPhone}`, 50, 330, 10);
      drawText(`Outstanding Fees: ${student.outstandingFees}`, 50, 310, 10);
      drawText(`Pending Documents: ${student.pendingDocuments}`, 50, 290, 10);
      drawText(`Professional Society: ${student.profSociety}`, 50, 270, 10);
      drawText(`Student Status: ${student.studentStatus}`, 50, 250, 10);

      if (student.imageUrl) {
        try {
          console.log(`Fetching image for ${student.name}: ${student.imageUrl}`);
          const imageRes = await axios.get(student.imageUrl, { responseType: 'arraybuffer' });
          const imageBytes = imageRes.data;
          console.log('Image bytes fetched, size:', imageBytes.byteLength);
          let image;
          try {
            image = await pdfDoc.embedJpg(imageBytes);
          } catch (e: any) {
            console.log(`Image is not JPG, trying PNG: ${e.message}`);
            image = await pdfDoc.embedPng(imageBytes);
          }

          const imgDims = image.scale(0.25);
          const x = 400;
          const y = 700;
          page.drawImage(image, {
            x,
            y,
            width: imgDims.width,
            height: imgDims.height,
          });
          console.log(`Image embedded for ${student.name}, dimensions:`, { width: imgDims.width, height: imgDims.height });
        } catch (imageError: any) {
          console.error(`Failed to embed image for ${student.name}:`, imageError.message);
        }
      }
    }

    const pdfBytes = await pdfDoc.save();
    console.log('PDF bytes generated, size:', pdfBytes.length);
    console.log('First few bytes of PDF:', pdfBytes.slice(0, 10).toString());

    const fileName = `student_biodata_${Date.now()}.pdf`;
    const outputPath = path.join(process.cwd(), 'public', 'downloads', fileName);

    console.log('Saving PDF to:', outputPath);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, pdfBytes);
    const fileStats = await fs.stat(outputPath);
    console.log('PDF saved successfully, size on disk:', fileStats.size);

    const savedBytes = await fs.readFile(outputPath);
    console.log('Saved file first few bytes:', savedBytes.slice(0, 10).toString('hex'));

    const downloadUrl = `/downloads/${fileName}`;
    res.status(200).json({ url: downloadUrl });
  } catch (error: any) {
    console.error('PDF generation error:', error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
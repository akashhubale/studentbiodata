import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentBiodata extends Document {
  name: string;
  sectionAndRollNo: string;
  branch: string;
  dateOfBirth: string;
  fatherName: string;
  fatherOccupation: string;
  permanentAddress: string;
  fatherPhoneOffice: string;
  residencePhone: string;
  studentMobile: string;
  fatherMobile: string;
  motherMobile: string;
  fatherOfficeAddress: string;
  studentEmail: string;
  fatherEmail: string;
  hostelName: string;
  hostelWardenName: string;
  hostelPhone: string;
  hostelWardenPhone: string;
  roommates: string;
  localGuardian: string;
  localGuardianAddressPhone: string;

  outstandingFees: string;
  pendingDocuments: string;
  profSociety: string;
  studentStatus: string;

  fifthTermReport: Record<string, string>; // Fortnight tracking: July to Oct
  fifthTermProgress: {
    jul: string;
    aug: string;
    sept: string;
    oct: string;
  };

  sixthTermReport: Record<string, string>; // Fortnight tracking: Jan to April
  sixthTermProgress: {
    jan: string;
    feb: string;
    mar: string;
    apr: string;
  };

  academicRecords: {
    termVII: {
      result: string;
      details: string;
      sgpa: string;
      cgpa: string;
    };
    termVIII: {
      result: string;
      details: string;
      sgpa: string;
      cgpa: string;
    };
  };

  projectDetails: {
    sem: string;
    date: string;
    status: string;
    remark: string;
  }[];

  participation: {
    sem: string;
    eventName: string;
    eventPlace: string;
    level: string;
    date: string;
  }[];

  phoneDiary: {
    date: string;
    mobile: string;
    reason: string;
  }[];

  parentsVisit: {
    date: string;
    parentName: string;
    remark: string;
    detention: string;
  }[];

  imageUrl: string;

  createdAt: Date;
}

const StudentBiodataSchema = new Schema<IStudentBiodata>({
  name: { type: String, required: true },
  sectionAndRollNo: String,
  branch: String,
  dateOfBirth: String,
  fatherName: String,
  fatherOccupation: String,
  permanentAddress: String,
  fatherPhoneOffice: String,
  residencePhone: String,
  studentMobile: String,
  fatherMobile: String,
  motherMobile: String,
  fatherOfficeAddress: String,
  studentEmail: String,
  fatherEmail: String,
  hostelName: String,
  hostelWardenName: String,
  hostelPhone: String,
  hostelWardenPhone: String,
  roommates: String,
  localGuardian: String,
  localGuardianAddressPhone: String,

  outstandingFees: String,
  pendingDocuments: String,
  profSociety: String,
  studentStatus: String,

  fifthTermReport: { type: Map, of: String },
  fifthTermProgress: {
    jul: String,
    aug: String,
    sept: String,
    oct: String
  },

  sixthTermReport: { type: Map, of: String },
  sixthTermProgress: {
    jan: String,
    feb: String,
    mar: String,
    apr: String
  },

  academicRecords: {
    termVII: {
      result: String,
      details: String,
      sgpa: String,
      cgpa: String
    },
    termVIII: {
      result: String,
      details: String,
      sgpa: String,
      cgpa: String
    }
  },

  projectDetails: [
    {
      sem: String,
      date: String,
      status: String,
      remark: String
    }
  ],

  participation: [
    {
      sem: String,
      eventName: String,
      eventPlace: String,
      level: String,
      date: String
    }
  ],

  phoneDiary: [
    {
      date: String,
      mobile: String,
      reason: String
    }
  ],

  parentsVisit: [
    {
      date: String,
      parentName: String,
      remark: String,
      detention: String
    }
  ],

  imageUrl: String,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.StudentBiodata ||
  mongoose.model<IStudentBiodata>('StudentBiodata', StudentBiodataSchema);

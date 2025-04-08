"use client";
import React, { useState } from 'react';
import axios from 'axios';

const StudentBiodataForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sectionAndRollNo: '',
    branch: '',
    dateOfBirth: '',
    fatherName: '',
    fatherOccupation: '',
    permanentAddress: '',
    fatherPhoneOffice: '',
    residencePhone: '',
    studentMobile: '',
    fatherMobile: '',
    motherMobile: '',
    fatherOfficeAddress: '',
    studentEmail: '',
    fatherEmail: '',
    hostelName: '',
    hostelWardenName: '',
    hostelPhone: '',
    hostelWardenPhone: '',
    roommates: '',
    localGuardian: '',
    localGuardianAddressPhone: '',
    outstandingFees: '',
    pendingDocuments: '',
    profSociety: '',
    studentStatus: '',
    fifthTermProgress: { jul: '', aug: '', sept: '', oct: '' },
    sixthTermProgress: { jan: '', feb: '', mar: '', apr: '' },
    academicRecords: {
      termVII: { result: '', details: '', sgpa: '', cgpa: '' },
      termVIII: { result: '', details: '', sgpa: '', cgpa: '' }
    },
    projectDetails: [{ sem: '', date: '', status: '', remark: '' }],
    participation: [{ sem: '', eventName: '', eventPlace: '', level: '', date: '' }],
    phoneDiary: [{ date: '', mobile: '', reason: '' }],
    parentsVisit: [{ date: '', parentName: '', remark: '', detention: '' }],
    image: null as File | null
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (path: string, value: string) => {
    setFormData(prev => {
      const parts = path.split('.');
      if (parts.length === 2) {
        const [section, field] = parts as [keyof typeof formData, string];
        const sectionData = prev[section];
        if (typeof sectionData === 'object' && sectionData !== null && !Array.isArray(sectionData)) {
          return { ...prev, [section]: { ...sectionData, [field]: value } };
        }
      } else if (parts.length === 3) {
        const [section, subsection, field] = parts as ['academicRecords', 'termVII' | 'termVIII', string];
        if (section === 'academicRecords') {
          const academicRecords = prev.academicRecords;
          return {
            ...prev,
            academicRecords: {
              ...academicRecords,
              [subsection]: { ...academicRecords[subsection], [field]: value }
            }
          };
        }
      }
      return prev;
    });
  };

  const handleArrayChange = (
    section: 'projectDetails' | 'participation' | 'phoneDiary' | 'parentsVisit',
    index: number,
    field: string,
    value: string
  ) => {
    setFormData(prev => {
      const sectionData = prev[section];
      if (!Array.isArray(sectionData)) return prev;
  
      const updatedArray = [...sectionData];
      const currentItem = updatedArray[index];
  
      switch (section) {
        case 'projectDetails':
          updatedArray[index] = {
            ...currentItem as { sem: string; date: string; status: string; remark: string },
            [field]: value
          };
          break;
        case 'participation':
          updatedArray[index] = {
            ...currentItem as { sem: string; eventName: string; eventPlace: string; level: string; date: string },
            [field]: value
          };
          break;
        case 'phoneDiary':
          updatedArray[index] = {
            ...currentItem as { date: string; mobile: string; reason: string },
            [field]: value
          };
          break;
        case 'parentsVisit':
          updatedArray[index] = {
            ...currentItem as { date: string; parentName: string; remark: string; detention: string },
            [field]: value
          };
          break;
      }
  
      return { ...prev, [section]: updatedArray };
    });
  };

  const addArrayItem = (section: 'projectDetails' | 'participation' | 'phoneDiary' | 'parentsVisit') => {
    setFormData(prev => {
      switch (section) {
        case 'projectDetails':
          return {
            ...prev,
            projectDetails: [
              ...prev.projectDetails,
              { sem: '', date: '', status: '', remark: '' }
            ]
          };
        case 'participation':
          return {
            ...prev,
            participation: [
              ...prev.participation,
              { sem: '', eventName: '', eventPlace: '', level: '', date: '' }
            ]
          };
        case 'phoneDiary':
          return {
            ...prev,
            phoneDiary: [
              ...prev.phoneDiary,
              { date: '', mobile: '', reason: '' }
            ]
          };
        case 'parentsVisit':
          return {
            ...prev,
            parentsVisit: [
              ...prev.parentsVisit,
              { date: '', parentName: '', remark: '', detention: '' }
            ]
          };
        default:
          return prev;
      }
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (
      !formData.name.trim() || 
      !formData.sectionAndRollNo.trim() || 
      !formData.branch.trim() || 
      !formData.dateOfBirth.trim() || 
      !formData.image
    ) {
      alert('Please fill all required fields: Name, Section & Roll No, Branch, Date of Birth, and Profile Image');
      return;
    }
  
    try {
      const cloudinaryData = new FormData();
      cloudinaryData.append('file', formData.image as File);
      cloudinaryData.append('upload_preset', 'datahunk');
      cloudinaryData.append('cloud_name', 'dykhhscwf');
  
      const cloudinaryResponse = await axios.post(
        'https://api.cloudinary.com/v1_1/dykhhscwf/image/upload',
        cloudinaryData
      );
  
      const imageUrl = cloudinaryResponse.data.secure_url;
  
      const backendData = new FormData();
      for (const [key, value] of Object.entries(formData)) {
        if (key === 'image') {
          backendData.append('imageUrl', imageUrl);
        } else if (typeof value === 'object' && value !== null) {
          backendData.append(key, JSON.stringify(value));
        } else {
          backendData.append(key, value as string || '');
        }
      }
  
      const response = await fetch('/api/student-biodata', {
        method: 'POST',
        body: backendData,
      });
  
      if (!response.ok) {
        throw new Error('Failed to submit form');
      }
  
      const result = await response.json();
      console.log('Form submitted successfully:', result);
      alert('Student biodata submitted successfully!');
  
      setFormData({
        name: '',
        sectionAndRollNo: '',
        branch: '',
        dateOfBirth: '',
        fatherName: '',
        fatherOccupation: '',
        permanentAddress: '',
        fatherPhoneOffice: '',
        residencePhone: '',
        studentMobile: '',
        fatherMobile: '',
        motherMobile: '',
        fatherOfficeAddress: '',
        studentEmail: '',
        fatherEmail: '',
        hostelName: '',
        hostelWardenName: '',
        hostelPhone: '',
        hostelWardenPhone: '',
        roommates: '',
        localGuardian: '',
        localGuardianAddressPhone: '',
        outstandingFees: '',
        pendingDocuments: '',
        profSociety: '',
        studentStatus: '',
        fifthTermProgress: { jul: '', aug: '', sept: '', oct: '' },
        sixthTermProgress: { jan: '', feb: '', mar: '', apr: '' },
        academicRecords: {
          termVII: { result: '', details: '', sgpa: '', cgpa: '' },
          termVIII: { result: '', details: '', sgpa: '', cgpa: '' },
        },
        projectDetails: [{ sem: '', date: '', status: '', remark: '' }],
        participation: [{ sem: '', eventName: '', eventPlace: '', level: '', date: '' }],
        phoneDiary: [{ date: '', mobile: '', reason: '' }],
        parentsVisit: [{ date: '', parentName: '', remark: '', detention: '' }],
        image: null,
      });
      setPreviewImage(null);
      setStep(1);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again.');
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const renderSection = () => {
    switch (step) {
      case 1: // Basic Info
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700">Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Section & Roll No</label><input type="text" name="sectionAndRollNo" value={formData.sectionAndRollNo} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Branch</label><input type="text" name="branch" value={formData.branch} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Date of Birth</label><input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" /></div>
            </div>
          </div>
        );
      case 2: // Family Info
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Family Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700">Father&apos;s Name</label><input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Father&apos;s Occupation</label><input type="text" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Father&apos;s Office Phone</label><input type="tel" name="fatherPhoneOffice" value={formData.fatherPhoneOffice} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Residence Phone</label><input type="tel" name="residencePhone" value={formData.residencePhone} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Student&apos;s Mobile</label><input type="tel" name="studentMobile" value={formData.studentMobile} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Father&apos;s Mobile</label><input type="tel" name="fatherMobile" value={formData.fatherMobile} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Mother&apos;s Mobile</label><input type="tel" name="motherMobile" value={formData.motherMobile} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Student&apos;s Email</label><input type="email" name="studentEmail" value={formData.studentEmail} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Father&apos;s Email</label><input type="email" name="fatherEmail" value={formData.fatherEmail} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" /></div>
              <div className="col-span-2"><label className="block text-sm font-medium text-gray-700">Permanent Address</label><textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" /></div>
              <div className="col-span-2"><label className="block text-sm font-medium text-gray-700">Father&apos;s Office Address</label><textarea name="fatherOfficeAddress" value={formData.fatherOfficeAddress} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" /></div>
            </div>
          </div>
        );
      case 3: // Hostel & Guardian
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Hostel & Guardian Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700">Hostel Name</label><input type="text" name="hostelName" value={formData.hostelName} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Hostel Warden Name</label><input type="text" name="hostelWardenName" value={formData.hostelWardenName} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Hostel Phone</label><input type="tel" name="hostelPhone" value={formData.hostelPhone} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Hostel Warden Phone</label><input type="tel" name="hostelWardenPhone" value={formData.hostelWardenPhone} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Roommates</label><input type="text" name="roommates" value={formData.roommates} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Local Guardian</label><input type="text" name="localGuardian" value={formData.localGuardian} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" /></div>
              <div className="col-span-2"><label className="block text-sm font-medium text-gray-700">Local Guardian Address & Phone</label><textarea name="localGuardianAddressPhone" value={formData.localGuardianAddressPhone} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" /></div>
            </div>
          </div>
        );
      case 4: // Academic Status
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Academic Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700">Outstanding Fees</label><input type="text" name="outstandingFees" value={formData.outstandingFees} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Pending Documents</label><input type="text" name="pendingDocuments" value={formData.pendingDocuments} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Professional Society</label><input type="text" name="profSociety" value={formData.profSociety} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Student Status</label><input type="text" name="studentStatus" value={formData.studentStatus} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" /></div>
            </div>
          </div>
        );
      case 5: // Term Progress
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Term Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700">Fifth Term Progress</h4>
                <div className="space-y-2 mt-2">
                  <input type="text" placeholder="July" value={formData.fifthTermProgress.jul} onChange={(e) => handleNestedChange('fifthTermProgress.jul', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                  <input type="text" placeholder="August" value={formData.fifthTermProgress.aug} onChange={(e) => handleNestedChange('fifthTermProgress.aug', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                  <input type="text" placeholder="September" value={formData.fifthTermProgress.sept} onChange={(e) => handleNestedChange('fifthTermProgress.sept', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                  <input type="text" placeholder="October" value={formData.fifthTermProgress.oct} onChange={(e) => handleNestedChange('fifthTermProgress.oct', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Sixth Term Progress</h4>
                <div className="space-y-2 mt-2">
                  <input type="text" placeholder="January" value={formData.sixthTermProgress.jan} onChange={(e) => handleNestedChange('sixthTermProgress.jan', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                  <input type="text" placeholder="February" value={formData.sixthTermProgress.feb} onChange={(e) => handleNestedChange('sixthTermProgress.feb', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                  <input type="text" placeholder="March" value={formData.sixthTermProgress.mar} onChange={(e) => handleNestedChange('sixthTermProgress.mar', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                  <input type="text" placeholder="April" value={formData.sixthTermProgress.apr} onChange={(e) => handleNestedChange('sixthTermProgress.apr', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                </div>
              </div>
            </div>
          </div>
        );
      case 6: // Academic Records
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Academic Records</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700">Term VII</h4>
                <div className="space-y-2 mt-2">
                  <input type="text" placeholder="Result" value={formData.academicRecords.termVII.result} onChange={(e) => handleNestedChange('academicRecords.termVII.result', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                  <input type="text" placeholder="Details" value={formData.academicRecords.termVII.details} onChange={(e) => handleNestedChange('academicRecords.termVII.details', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                  <input type="text" placeholder="SGPA" value={formData.academicRecords.termVII.sgpa} onChange={(e) => handleNestedChange('academicRecords.termVII.sgpa', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                  <input type="text" placeholder="CGPA" value={formData.academicRecords.termVII.cgpa} onChange={(e) => handleNestedChange('academicRecords.termVII.cgpa', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Term VIII</h4>
                <div className="space-y-2 mt-2">
                  <input type="text" placeholder="Result" value={formData.academicRecords.termVIII.result} onChange={(e) => handleNestedChange('academicRecords.termVIII.result', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                  <input type="text" placeholder="Details" value={formData.academicRecords.termVIII.details} onChange={(e) => handleNestedChange('academicRecords.termVIII.details', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                  <input type="text" placeholder="SGPA" value={formData.academicRecords.termVIII.sgpa} onChange={(e) => handleNestedChange('academicRecords.termVIII.sgpa', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                  <input type="text" placeholder="CGPA" value={formData.academicRecords.termVIII.cgpa} onChange={(e) => handleNestedChange('academicRecords.termVIII.cgpa', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                </div>
              </div>
            </div>
          </div>
        );
      case 7: // Projects & Activities
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Projects & Activities</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-700">Project Details</h4>
                {formData.projectDetails.map((project, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <input type="text" placeholder="Semester" value={project.sem} onChange={(e) => handleArrayChange('projectDetails', index, 'sem', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                    <input type="date" placeholder="Date" value={project.date} onChange={(e) => handleArrayChange('projectDetails', index, 'date', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                    <input type="text" placeholder="Status" value={project.status} onChange={(e) => handleArrayChange('projectDetails', index, 'status', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                    <input type="text" placeholder="Remark" value={project.remark} onChange={(e) => handleArrayChange('projectDetails', index, 'remark', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                  </div>
                ))}
                <button type="button" onClick={() => addArrayItem('projectDetails')} className="mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200">Add Project</button>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Participation</h4>
                {formData.participation.map((event, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <input type="text" placeholder="Semester" value={event.sem} onChange={(e) => handleArrayChange('participation', index, 'sem', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                    <input type="text" placeholder="Event Name" value={event.eventName} onChange={(e) => handleArrayChange('participation', index, 'eventName', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                    <input type="text" placeholder="Event Place" value={event.eventPlace} onChange={(e) => handleArrayChange('participation', index, 'eventPlace', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                    <input type="text" placeholder="Level" value={event.level} onChange={(e) => handleArrayChange('participation', index, 'level', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                    <input type="date" placeholder="Date" value={event.date} onChange={(e) => handleArrayChange('participation', index, 'date', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                  </div>
                ))}
                <button type="button" onClick={() => addArrayItem('participation')} className="mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200">Add Participation</button>
              </div>
            </div>
          </div>
        );
      case 8: // Records & Image
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Records & Image</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-700">Phone Diary</h4>
                {formData.phoneDiary.map((entry, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    <input type="date" placeholder="Date" value={entry.date} onChange={(e) => handleArrayChange('phoneDiary', index, 'date', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                    <input type="tel" placeholder="Mobile" value={entry.mobile} onChange={(e) => handleArrayChange('phoneDiary', index, 'mobile', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                    <input type="text" placeholder="Reason" value={entry.reason} onChange={(e) => handleArrayChange('phoneDiary', index, 'reason', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                  </div>
                ))}
                <button type="button" onClick={() => addArrayItem('phoneDiary')} className="mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200">Add Phone Entry</button>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Parents Visit</h4>
                {formData.parentsVisit.map((visit, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <input type="date" placeholder="Date" value={visit.date} onChange={(e) => handleArrayChange('parentsVisit', index, 'date', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                    <input type="text" placeholder="Parent Name" value={visit.parentName} onChange={(e) => handleArrayChange('parentsVisit', index, 'parentName', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                    <input type="text" placeholder="Remark" value={visit.remark} onChange={(e) => handleArrayChange('parentsVisit', index, 'remark', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                    <input type="text" placeholder="Detention" value={visit.detention} onChange={(e) => handleArrayChange('parentsVisit', index, 'detention', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                  </div>
                ))}
                <button type="button" onClick={() => addArrayItem('parentsVisit')} className="mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200">Add Visit</button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Profile Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange} required className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                {previewImage && <img src={previewImage} alt="Preview" className="mt-2 max-w-xs rounded-md shadow-sm" />}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Student Biodata Form</h2>
      
      <div className="flex justify-between mb-8 flex-wrap gap-2">
        {['Basic', 'Family', 'Hostel', 'Status', 'Progress', 'Records', 'Projects', 'Final'].map((label, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === index + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              {index + 1}
            </div>
            <span className="text-sm mt-1">{label}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {renderSection()}
        
        <div className="mt-6 flex justify-between">
          {step > 1 && (
            <button type="button" onClick={prevStep} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
              Previous
            </button>
          )}
          {step < 8 ? (
            <button type="button" onClick={nextStep} className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
              Next
            </button>
          ) : (
            <button type="submit" className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
              Submit
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default StudentBiodataForm;
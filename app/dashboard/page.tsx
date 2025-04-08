'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Define the Student interface based on the properties used in the code
interface Student {
  _id: string;
  name: string;
  branch: string;
  sectionAndRollNo: string;
  studentEmail?: string;
  studentMobile?: string;
  fatherName?: string;
  hostelName?: string;
  imageUrl?: string;
  dateOfBirth?: string;
  fatherOccupation?: string;
  permanentAddress?: string;
  fatherPhoneOffice?: string;
  residencePhone?: string;
  fatherMobile?: string;
  motherMobile?: string;
  fatherOfficeAddress?: string;
  fatherEmail?: string;
  hostelWardenName?: string;
  hostelPhone?: string;
  hostelWardenPhone?: string;
  roommates?: string;
  localGuardian?: string;
  localGuardianAddressPhone?: string;
  outstandingFees?: string;
  pendingDocuments?: string;
  profSociety?: string;
  studentStatus?: string;
}

export default function FacultyDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filtered, setFiltered] = useState<Student[]>([]);
  const [search, setSearch] = useState<string>('');
  const [selected, setSelected] = useState<string[]>([]);
  const [viewDetails, setViewDetails] = useState<string | null>(null);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/student/all')
      .then(res => res.json())
      .then((data: Student[]) => {
        setStudents(data);
        setFiltered(data);
      });
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    const query = e.target.value.toLowerCase();
    setFiltered(students.filter(s =>
      s.name.toLowerCase().includes(query) ||
      s.branch.toLowerCase().includes(query) ||
      s.sectionAndRollNo.toLowerCase().includes(query)
    ));
  };

  const toggleSelect = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const downloadPDF = async (studentIds: string[], filename: string) => {
    try {
      const res = await fetch('/api/pdf/generate', {
        method: 'POST',
        body: JSON.stringify({ ids: studentIds }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to generate PDF');
      }

      const { url } = await res.json();
      console.log('Download URL:', url);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editStudent) return;

    const res = await fetch(`/api/student/${editStudent._id}`, {
      method: 'PUT',
      body: JSON.stringify(editStudent),
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      const updatedStudent: Student = await res.json();
      setStudents(students.map(s => s._id === updatedStudent._id ? updatedStudent : s));
      setFiltered(filtered.map(s => s._id === updatedStudent._id ? updatedStudent : s));
      setEditStudent(null);
    }
  };

  const handleLogout = () => {
    router.push('/');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Faculty Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
          Logout
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by name, branch, or roll no"
        value={search}
        onChange={handleSearch}
        className="w-full p-2 border mb-4"
      />

      <button
        onClick={() => downloadPDF(selected, 'students.pdf')}
        className="bg-green-600 text-white px-4 py-2 rounded mb-4"
        disabled={!selected.length}
      >
        Download {selected.length || ''} Selected
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((student) => (
          <div key={student._id} className="border p-4 rounded shadow">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">{student.name}</h2>
              <input
                type="checkbox"
                checked={selected.includes(student._id)}
                onChange={() => toggleSelect(student._id)}
              />
            </div>
            <p><b>Branch:</b> {student.branch}</p>
            <p><b>Roll No:</b> {student.sectionAndRollNo}</p>
            <div className="mt-2 space-x-2">
              <button
                onClick={() => setViewDetails(viewDetails === student._id ? null : student._id)}
                className="bg-gray-500 text-white px-2 py-1 rounded"
              >
                {viewDetails === student._id ? 'Hide' : 'View'} Details
              </button>
              <button
                onClick={() => setEditStudent(student)}
                className="bg-yellow-500 text-white px-2 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => downloadPDF([student._id], `${student.name}_biodata.pdf`)}
                className="bg-blue-500 text-white px-2 py-1 rounded"
              >
                Download PDF
              </button>
            </div>

            {viewDetails === student._id && (
              <div className="mt-2">
                <p><b>Email:</b> {student.studentEmail || 'N/A'}</p>
                <p><b>Mobile:</b> {student.studentMobile || 'N/A'}</p>
                <p><b>Father:</b> {student.fatherName || 'N/A'}</p>
                <p><b>Hostel:</b> {student.hostelName || 'N/A'}</p>
                {student.imageUrl && (
                  <img src={student.imageUrl} alt="Student" className="w-24 h-24 mt-2" />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {editStudent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <form onSubmit={handleUpdate} className="bg-white p-6 rounded shadow-lg max-h-[80vh] overflow-y-auto w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Edit Student</h2>
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
                <input
                  type="text"
                  value={editStudent.name}
                  onChange={(e) => setEditStudent({ ...editStudent, name: e.target.value })}
                  placeholder="Name"
                  className="w-full p-2 border"
                  required
                />
                <input
                  type="text"
                  value={editStudent.sectionAndRollNo}
                  onChange={(e) => setEditStudent({ ...editStudent, sectionAndRollNo: e.target.value })}
                  placeholder="Section & Roll No"
                  className="w-full p-2 border mt-2"
                />
                <input
                  type="text"
                  value={editStudent.branch}
                  onChange={(e) => setEditStudent({ ...editStudent, branch: e.target.value })}
                  placeholder="Branch"
                  className="w-full p-2 border mt-2"
                />
                <input
                  type="text"
                  value={editStudent.dateOfBirth}
                  onChange={(e) => setEditStudent({ ...editStudent, dateOfBirth: e.target.value })}
                  placeholder="Date of Birth (e.g., YYYY-MM-DD)"
                  className="w-full p-2 border mt-2"
                />
                <input
                  type="text"
                  value={editStudent.studentEmail}
                  onChange={(e) => setEditStudent({ ...editStudent, studentEmail: e.target.value })}
                  placeholder="Student Email"
                  className="w-full p-2 border mt-2"
                />
                <input
                  type="text"
                  value={editStudent.studentMobile}
                  onChange={(e) => setEditStudent({ ...editStudent, studentMobile: e.target.value })}
                  placeholder="Student Mobile"
                  className="w-full p-2 border mt-2"
                />
              </div>

              {/* Family Info */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Family Information</h3>
                <input
                  type="text"
                  value={editStudent.fatherName}
                  onChange={(e) => setEditStudent({ ...editStudent, fatherName: e.target.value })}
                  placeholder="Father's Name"
                  className="w-full p-2 border"
                />
                <input
                  type="text"
                  value={editStudent.fatherOccupation}
                  onChange={(e) => setEditStudent({ ...editStudent, fatherOccupation: e.target.value })}
                  placeholder="Father's Occupation"
                  className="w-full p-2 border mt-2"
                />
                <textarea
                  value={editStudent.permanentAddress}
                  onChange={(e) => setEditStudent({ ...editStudent, permanentAddress: e.target.value })}
                  placeholder="Permanent Address"
                  className="w-full p-2 border mt-2"
                />
                <input
                  type="text"
                  value={editStudent.fatherPhoneOffice}
                  onChange={(e) => setEditStudent({ ...editStudent, fatherPhoneOffice: e.target.value })}
                  placeholder="Father's Office Phone"
                  className="w-full p-2 border mt-2"
                />
                <input
                  type="text"
                  value={editStudent.residencePhone}
                  onChange={(e) => setEditStudent({ ...editStudent, residencePhone: e.target.value })}
                  placeholder="Residence Phone"
                  className="w-full p-2 border mt-2"
                />
                <input
                  type="text"
                  value={editStudent.fatherMobile}
                  onChange={(e) => setEditStudent({ ...editStudent, fatherMobile: e.target.value })}
                  placeholder="Father's Mobile"
                  className="w-full p-2 border mt-2"
                />
                <input
                  type="text"
                  value={editStudent.motherMobile}
                  onChange={(e) => setEditStudent({ ...editStudent, motherMobile: e.target.value })}
                  placeholder="Mother's Mobile"
                  className="w-full p-2 border mt-2"
                />
                <textarea
                  value={editStudent.fatherOfficeAddress}
                  onChange={(e) => setEditStudent({ ...editStudent, fatherOfficeAddress: e.target.value })}
                  placeholder="Father's Office Address"
                  className="w-full p-2 border mt-2"
                />
                <input
                  type="text"
                  value={editStudent.fatherEmail}
                  onChange={(e) => setEditStudent({ ...editStudent, fatherEmail: e.target.value })}
                  placeholder="Father's Email"
                  className="w-full p-2 border mt-2"
                />
              </div>

              {/* Hostel Info */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Hostel Information</h3>
                <input
                  type="text"
                  value={editStudent.hostelName}
                  onChange={(e) => setEditStudent({ ...editStudent, hostelName: e.target.value })}
                  placeholder="Hostel Name"
                  className="w-full p-2 border"
                />
                <input
                  type="text"
                  value={editStudent.hostelWardenName}
                  onChange={(e) => setEditStudent({ ...editStudent, hostelWardenName: e.target.value })}
                  placeholder="Hostel Warden Name"
                  className="w-full p-2 border mt-2"
                />
                <input
                  type="text"
                  value={editStudent.hostelPhone}
                  onChange={(e) => setEditStudent({ ...editStudent, hostelPhone: e.target.value })}
                  placeholder="Hostel Phone"
                  className="w-full p-2 border mt-2"
                />
                <input
                  type="text"
                  value={editStudent.hostelWardenPhone}
                  onChange={(e) => setEditStudent({ ...editStudent, hostelWardenPhone: e.target.value })}
                  placeholder="Hostel Warden Phone"
                  className="w-full p-2 border mt-2"
                />
                <input
                  type="text"
                  value={editStudent.roommates}
                  onChange={(e) => setEditStudent({ ...editStudent, roommates: e.target.value })}
                  placeholder="Roommates (comma-separated)"
                  className="w-full p-2 border mt-2"
                />
              </div>

              {/* Guardian Info */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Local Guardian</h3>
                <input
                  type="text"
                  value={editStudent.localGuardian}
                  onChange={(e) => setEditStudent({ ...editStudent, localGuardian: e.target.value })}
                  placeholder="Local Guardian Name"
                  className="w-full p-2 border"
                />
                <textarea
                  value={editStudent.localGuardianAddressPhone}
                  onChange={(e) => setEditStudent({ ...editStudent, localGuardianAddressPhone: e.target.value })}
                  placeholder="Local Guardian Address & Phone"
                  className="w-full p-2 border mt-2"
                />
              </div>

              {/* Administrative Info */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Administrative Details</h3>
                <input
                  type="text"
                  value={editStudent.outstandingFees}
                  onChange={(e) => setEditStudent({ ...editStudent, outstandingFees: e.target.value })}
                  placeholder="Outstanding Fees"
                  className="w-full p-2 border"
                />
                <input
                  type="text"
                  value={editStudent.pendingDocuments}
                  onChange={(e) => setEditStudent({ ...editStudent, pendingDocuments: e.target.value })}
                  placeholder="Pending Documents"
                  className="w-full p-2 border mt-2"
                />
                <input
                  type="text"
                  value={editStudent.profSociety}
                  onChange={(e) => setEditStudent({ ...editStudent, profSociety: e.target.value })}
                  placeholder="Professional Society"
                  className="w-full p-2 border mt-2"
                />
                <input
                  type="text"
                  value={editStudent.studentStatus}
                  onChange={(e) => setEditStudent({ ...editStudent, studentStatus: e.target.value })}
                  placeholder="Student Status"
                  className="w-full p-2 border mt-2"
                />
              </div>
            </div>

            <div className="mt-6 space-x-2">
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditStudent(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
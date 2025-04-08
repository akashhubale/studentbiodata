import StudentBiodataForm from "@/components/home";
import FacultyNavbar from "@/components/navbar";
import Image from "next/image";

export default function Home() {
  return (
   <div>
  <FacultyNavbar/>

    <StudentBiodataForm/>
   </div>
  );
}

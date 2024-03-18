"use client";
import { useSearchParams, useParams } from "next/navigation";
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  useMutation,
} from "@apollo/client";
import { DELETE_INSTITUTION_MUTATION } from "@/apollo/mutation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { UPDATE_INSTITUTION_MUTATION } from "@/apollo/mutation";
import { httpLink } from "@/components/apolloConfig/apolloConfig";

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

function InstitutionPage() {
  const { id } = useParams();
  const sorted = useSearchParams();
  const [name, setName] = useState(sorted.get("name"));
  const [email, setEmail] = useState(sorted.get("email"));
  const [phoneNumber, setPhoneNumber] = useState(sorted.get("phoneNumber"));
  const originalName = sorted.get("name");

  const [deleteInstitution] = useMutation(DELETE_INSTITUTION_MUTATION, {
    client,
  });

  const [updateInstitution] = useMutation(UPDATE_INSTITUTION_MUTATION, {
    client,
  })

  const handleDelete = async (e: React.FormEvent) => {
    const idNumber = parseInt(Array.isArray(id) ? id[0] : id, 10);

    const { data } = await deleteInstitution({
      variables: { id: idNumber },
    });
    //console.log("datos de la api llamada [id]: ", data);
    if (data?.deleteInstitution?.success) {
      alert("Institution deleted successfully");
      window.location.href = "/superUser/dashboard";
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    const { data } = await updateInstitution({
      variables: {
        updateInstitutionInput: {
          name: originalName,
          newName: name,
          newEmail: email,
          newPhoneNumber: phoneNumber
        }
      }
    })
    console.log("data update user", data)
    if (data?.updateInstitution?.id) {
      alert("Institution updated successfully");
      window.location.href = "/superUser/dashboard";
    }
  }
  

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 ">
      <div className="relative p-8 bg-white rounded shadow-md w-1/2 mt-12">
        <h1 className="text-2xl font-bold mb-4">{originalName}</h1>
        <h2 className="mb-4">{email}</h2>
        <h2 className="mb-4">{phoneNumber}</h2>
        <></>
        <div className="mb-6">
          <Input 
            value={name || ""} 
            onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="mb-6">
          <Input
            value={email || ""}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <Input
            value={phoneNumber || ""}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
        <div className="mb-10">
          <button
            className="absolute bottom-0 right-0 mb-4 mr-4 p-2 bg-red-500 text-white rounded-full"
            onClick={handleDelete}
            disabled={!name || !email || !phoneNumber}
          >
            <i className="material-icons">delete</i>
          </button>

        </div>
        <div className="mb-10">
          <button
            className="absolute bottom-0 right-0 mb-4 mr-16 p-2 bg-blue-500 text-white rounded-full"
            onClick={handleEdit}
            disabled={!name || !email || !phoneNumber}
          >
            <i className="material-icons">edit</i>
          </button>

        </div>
        

      </div>
    </div>
  );
}
export default InstitutionPage;

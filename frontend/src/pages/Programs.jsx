import React, { useState, useEffect, useMemo } from "react";
import ProgramHeader from "../components/ProgramHeader";
import ProgramsTable from "../components/ProgramsTable";
import EmployeesFilters from "../components/EmployeesFilters";
import ProgramModal from "../components/ProgramModal";
import { API_BASE_URL } from "../config/api";

import { usePrograms, useCreateProgram } from "../hooks/usePrograms";
import toast from "react-hot-toast";

function Programs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: projects = [], isLoading } = usePrograms();
  const createProgram = useCreateProgram();

  const handleAddProject = (newProject) => {
    createProgram.mutate(newProject, {
      onSuccess: () => {
        toast.success("تم إضافة المشروع بنجاح");
        setShowAddModal(false);
      },
      onError: (err) => toast.error(err.response?.data?.message || "حدث خطأ أثناء الإضافة")
    });
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(project =>
      project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.funding_source?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);

  // Handle local pagination of filtered results (since backend doesn't support it for projects yet)
  const paginatedProjects = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredProjects.slice(start, start + pageSize);
  }, [filteredProjects, page, pageSize]);

  return (
    <div className="animate-fade-in">
      <ProgramHeader
        title="برامج التشغيل المؤقت"
        desc="إدارة المشاريع التي يتم من خلالها تشغيل موظفي العقود المؤقتة."
        onOpenAddModal={() => setShowAddModal(true)}
      />

      <EmployeesFilters
        pageSize={pageSize}
        onPageSizeChange={(newPageSize) => {
          setPageSize(newPageSize);
          setPage(1);
        }}
        searchTerm={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value);
          setPage(1);
        }}
        totalCount={filteredProjects.length}
        currentPage={page}
        onPageChange={setPage}
      />

      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-secondary">جارٍ تحميل البرامج...</p>
        </div>
      ) : (
        <ProgramsTable
          projects={paginatedProjects}
        />
      )}

      <ProgramModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddProject}
      />
    </div>
  );
}

export default Programs;



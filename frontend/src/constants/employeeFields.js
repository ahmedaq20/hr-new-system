export const stepsDefinition = [
    { title: "بيانات الموظف الأساسية", contentKey: "basic" },
    { title: "البيانات التنظيمية", contentKey: "org" },
    { title: "البيانات الوظيفية", contentKey: "job" },
    { title: "البيانات المهنية", contentKey: "prof" },
    { title: "البيانات المالية", contentKey: "finance" },
    { title: "مراجعة البيانات", contentKey: "review" },
];

export const fieldsDefinition = {
    basic: [
        { label: "الإسم الأول", type: "text", key: "first_name" },
        { label: "إسم الأب", type: "text", key: "second_name" },
        { label: "إسم الجد", type: "text", key: "third_name" },
        { label: "إسم العائلة", type: "text", key: "family_name" },
        { label: "الرقم الوظيفي", type: "number", key: "employee_number" },
        { label: "تاريخ الميلاد", type: "date", key: "birth_date" },
        { label: "الجنس", type: "select", options: [{ id: "male", value: "ذكر" }, { id: "female", value: "أنثى" }], key: "gender" },
        { label: "الحالة الإجتماعية", type: "select", options: [{ id: "married", value: "متزوج" }, { id: "divorced", value: "منفصل" }, { id: "single", value: "أعزب" }, { id: "widowed", value: "أرمل" }], key: "marital_status" },
        { label: "رقم الجوال", type: "number", key: "primary_phone" },
        { label: "رقم الجوال البديل", type: "number", key: "secondary_phone" },
        { label: "البريد الإلكتروني", type: "email", key: "email" },
        { label: "رقم الهوية", type: "number", key: "national_id" },
        { label: "تاريخ التعيين", type: "date", key: "date_of_appointment" },
        { label: "المحافظة", type: "select", lookupKey: "GOVERNORATE", key: "governorate_id" },
        { label: "المدينة", type: "select", lookupKey: "CITY", key: "city_id" },
        { label: "عنوان السكن بالتفصيل", type: "text", key: "address" },
    ],
    org: [
        { label: "الوزارة", type: "select", lookupKey: "MINISTRY", key: "ministry_id" },
        { label: "الإدارة العامة", type: "select", lookupKey: "MANAGEMENT_DEPARTMENT", key: "management_department_id" },
        { label: "الوحدة", type: "select", lookupKey: "UNIT", key: "unit_id" },
        { label: "المعبر", type: "select", lookupKey: "CROSSING", key: "crossing_id" },
        { label: "الدائرة", type: "select", lookupKey: "DEPARTMENT", key: "work_department_id" },
        { label: "القسم", type: "select", lookupKey: "SECTION", key: "section_id" },
        { label: "الشعبة", type: "select", lookupKey: "DIVISION", key: "division_id" },
        { label: "مكان العمل", type: "select", lookupKey: "SUB_OFFICE", key: "sub_office_id" },
    ],
    job: [
        { label: "المسمى الوظيفي", type: "select", lookupKey: "JOB_TITLE", key: "job_title_id" },
        { label: "الحالة الوظيفية", type: "select", lookupKey: "EMPLOYMENT_STATUS", key: "employment_status_id" },
        { label: "نوع التوظيف", type: "select", lookupKey: "EMPLOYMENT_TYPE", key: "employment_type_id" },
        {
            label: "نوع العقد",
            type: "select",
            lookupKey: "CONTRACT",
            key: "contract_id",
            showIf: (data, lookupsData) => {
                const contractTypeId = lookupsData?.EMPLOYMENT_TYPE?.find(t => t.slug === 'employment_type.contract')?.id;
                return String(data?.employment_type_id) === String(contractTypeId);
            }
        },
        { label: "البرنامج", type: "select", lookupKey: "PROGRAM", key: "program_id" },
        { label: "سلم الرواتب", type: "select", lookupKey: "JOB_SCALE", key: "job_scale_id" },
        { label: "هل الموظف إشرافي؟", type: "select", options: [{ id: 1, value: "نعم" }, { id: 0, value: "لا" }], key: "is_supervisory" },
    ],
    prof: [
        { label: "التصنيف", type: "select", lookupKey: "CLASSIFICATION", key: "classification_id" },
        { label: "الفئة", type: "select", lookupKey: "CATEGORY", key: "category_id" },
        { label: "الدرجة الوظيفية", type: "select", lookupKey: "DEGREE", key: "degree_id" },
        { label: "الأقدمية", type: "number", key: "seniority" },
        { label: "المؤهل العلمي", type: "select", lookupKey: "CERTIFICATE", key: "certificate_id" },
        { label: "خدمة فعلية", type: "number", key: "actual_service" },
        { label: "ترقية", type: "number", key: "promotion" },
        { label: "لأغراض الراتب", type: "number", key: "salary_purposes" },
        { label: "التجزئة", type: "number", key: "fragmentation" },
    ],
    finance: [
        { label: "إسم البنك", type: "select", lookupKey: "BANK", key: "bank_id" },
        { label: "رقم الحساب", type: "number", key: "bank_account_number" },
        { label: "الأيبان", type: "text", key: "bank_iban" },
    ],
};

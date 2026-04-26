const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const getToken = () => localStorage.getItem("token");

/* جلب الموظفين */
export const getEmployees = async () => {
  const response = await fetch(`${BASE_URL}/employees`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("UNAUTHENTICATED");
    }
    throw new Error("FAILED_TO_FETCH_EMPLOYEES");
  }

  return response.json();
};

/* إضافة موظف */
export const addEmployee = async (employee) => {
  const response = await fetch(`${BASE_URL}/employees`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      Accept: "application/json",
    },
    body: JSON.stringify(employee),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("UNAUTHENTICATED");
    }
    throw new Error("FAILED_TO_ADD_EMPLOYEE");
  }

  return response.json();
};

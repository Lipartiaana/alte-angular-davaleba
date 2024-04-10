export interface User {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  phone: string;
  address: {
    city: string;
    street: string;
  };
  skills: { skill: string }[];
  workExperience: { place: string; position: string; years: string }[];
}

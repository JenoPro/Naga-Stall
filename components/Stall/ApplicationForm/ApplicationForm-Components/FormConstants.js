// Dropdown options constants
export const civilStatusOptions = [
  { label: "Single", value: "Single" },
  { label: "Married", value: "Married" },
  { label: "Widowed", value: "Widowed" },
  { label: "Divorced", value: "Divorced" },
  { label: "Separated", value: "Separated" },
];

export const educationOptions = [
  { label: "Elementary Graduate", value: "Elementary Graduate" },
  { label: "Elementary Undergraduate", value: "Elementary Undergraduate" },
  { label: "High School Graduate", value: "High School Graduate" },
  { label: "High School Undergraduate", value: "High School Undergraduate" },
  { label: "Senior High School Graduate", value: "Senior High School Graduate" },
  { label: "Senior High School Undergraduate", value: "Senior High School Undergraduate" },
  { label: "College Graduate", value: "College Graduate" },
  { label: "College Undergraduate", value: "College Undergraduate" },
];

// Naga City Barangays (27 barangays)
export const barangayOptions = [
  { label: "Abella", value: "Abella" },
  { label: "Bagumbayan Norte", value: "Bagumbayan Norte" },
  { label: "Bagumbayan Sur", value: "Bagumbayan Sur" },
  { label: "Balatas", value: "Balatas" },
  { label: "Calauag", value: "Calauag" },
  { label: "Canaman", value: "Canaman" },
  { label: "Cararayan", value: "Cararayan" },
  { label: "Carolina", value: "Carolina" },
  { label: "Concepcion Grande", value: "Concepcion Grande" },
  { label: "Concepcion Pequeña", value: "Concepcion Pequeña" },
  { label: "Dayangdang", value: "Dayangdang" },
  { label: "Del Rosario", value: "Del Rosario" },
  { label: "Dinaga", value: "Dinaga" },
  { label: "Igualdad Interior", value: "Igualdad Interior" },
  { label: "Lerma", value: "Lerma" },
  { label: "Liboton", value: "Liboton" },
  { label: "Mabolo", value: "Mabolo" },
  { label: "Pacol", value: "Pacol" },
  { label: "Panicuason", value: "Panicuason" },
  { label: "Peñafrancia", value: "Peñafrancia" },
  { label: "Sabang", value: "Sabang" },
  { label: "San Felipe", value: "San Felipe" },
  { label: "San Francisco", value: "San Francisco" },
  { label: "San Isidro", value: "San Isidro" },
  { label: "Santa Cruz", value: "Santa Cruz" },
  { label: "Tabuco", value: "Tabuco" },
  { label: "Triangulo", value: "Triangulo" }
];

// Street options based on selected barangay
export const streetsByBarangay = {
  "Abella": [
    { label: "Abella Street", value: "Abella Street" },
    { label: "San Ramon Street", value: "San Ramon Street" },
    { label: "Aurora Street", value: "Aurora Street" },
    { label: "Magsaysay Avenue", value: "Magsaysay Avenue" }
  ],
  "Bagumbayan Norte": [
    { label: "Bagumbayan Street", value: "Bagumbayan Street" },
    { label: "Norte Avenue", value: "Norte Avenue" },
    { label: "Rizal Street", value: "Rizal Street" },
    { label: "Bonifacio Street", value: "Bonifacio Street" }
  ],
  "Bagumbayan Sur": [
    { label: "Sur Avenue", value: "Sur Avenue" },
    { label: "Mabini Street", value: "Mabini Street" },
    { label: "Quezon Street", value: "Quezon Street" },
    { label: "Luna Street", value: "Luna Street" }
  ],
  "Balatas": [
    { label: "Balatas Road", value: "Balatas Road" },
    { label: "Riverside Street", value: "Riverside Street" },
    { label: "Naga River Street", value: "Naga River Street" },
    { label: "Fisherman's Lane", value: "Fisherman's Lane" }
  ],
  "Calauag": [
    { label: "Calauag Street", value: "Calauag Street" },
    { label: "Provincial Road", value: "Provincial Road" },
    { label: "Market Street", value: "Market Street" },
    { label: "Church Street", value: "Church Street" }
  ],
  "Canaman": [
    { label: "Canaman Avenue", value: "Canaman Avenue" },
    { label: "Highway Street", value: "Highway Street" },
    { label: "Barangay Road", value: "Barangay Road" },
    { label: "Central Street", value: "Central Street" }
  ],
  "Cararayan": [
    { label: "Cararayan Street", value: "Cararayan Street" },
    { label: "Mountain View Road", value: "Mountain View Road" },
    { label: "Hillside Avenue", value: "Hillside Avenue" },
    { label: "Forest Street", value: "Forest Street" }
  ],
  "Carolina": [
    { label: "Carolina Avenue", value: "Carolina Avenue" },
    { label: "Km. 10 Road", value: "Km. 10 Road" },
    { label: "Industrial Street", value: "Industrial Street" },
    { label: "Factory Road", value: "Factory Road" }
  ],
  "Concepcion Grande": [
    { label: "Concepcion Street", value: "Concepcion Street" },
    { label: "Grande Avenue", value: "Grande Avenue" },
    { label: "Cathedral Road", value: "Cathedral Road" },
    { label: "Parish Street", value: "Parish Street" }
  ],
  "Concepcion Pequeña": [
    { label: "Pequeña Street", value: "Pequeña Street" },
    { label: "Chapel Road", value: "Chapel Road" },
    { label: "Community Street", value: "Community Street" },
    { label: "Residential Avenue", value: "Residential Avenue" }
  ],
  "Dayangdang": [
    { label: "Dayangdang Street", value: "Dayangdang Street" },
    { label: "Sunset Boulevard", value: "Sunset Boulevard" },
    { label: "Riverside Drive", value: "Riverside Drive" },
    { label: "Garden Street", value: "Garden Street" }
  ],
  "Del Rosario": [
    { label: "Del Rosario Avenue", value: "Del Rosario Avenue" },
    { label: "Rosary Street", value: "Rosary Street" },
    { label: "Faith Road", value: "Faith Road" },
    { label: "Prayer Lane", value: "Prayer Lane" }
  ],
  "Dinaga": [
    { label: "Dinaga Street", value: "Dinaga Street" },
    { label: "Historic Road", value: "Historic Road" },
    { label: "Heritage Avenue", value: "Heritage Avenue" },
    { label: "Old Town Street", value: "Old Town Street" }
  ],
  "Igualdad Interior": [
    { label: "Igualdad Street", value: "Igualdad Street" },
    { label: "Interior Road", value: "Interior Road" },
    { label: "Unity Avenue", value: "Unity Avenue" },
    { label: "Peace Street", value: "Peace Street" }
  ],
  "Lerma": [
    { label: "Lerma Street", value: "Lerma Street" },
    { label: "Educational Avenue", value: "Educational Avenue" },
    { label: "School Road", value: "School Road" },
    { label: "Academic Street", value: "Academic Street" }
  ],
  "Liboton": [
    { label: "Liboton Street", value: "Liboton Street" },
    { label: "Church Road", value: "Church Road" },
    { label: "Sacred Avenue", value: "Sacred Avenue" },
    { label: "Holy Street", value: "Holy Street" }
  ],
  "Mabolo": [
    { label: "Mabolo Street", value: "Mabolo Street" },
    { label: "Tree Avenue", value: "Tree Avenue" },
    { label: "Nature Road", value: "Nature Road" },
    { label: "Green Street", value: "Green Street" }
  ],
  "Pacol": [
    { label: "Pacol Avenue", value: "Pacol Avenue" },
    { label: "Km. 7 Road", value: "Km. 7 Road" },
    { label: "Km. 9 Road", value: "Km. 9 Road" },
    { label: "Highway Street", value: "Highway Street" },
    { label: "Main Road", value: "Main Road" }
  ],
  "Panicuason": [
    { label: "Panicuason Street", value: "Panicuason Street" },
    { label: "Agricultural Road", value: "Agricultural Road" },
    { label: "Farm Avenue", value: "Farm Avenue" },
    { label: "Rural Street", value: "Rural Street" }
  ],
  "Peñafrancia": [
    { label: "Peñafrancia Avenue", value: "Peñafrancia Avenue" },
    { label: "Basilica Road", value: "Basilica Road" },
    { label: "Pilgrim Street", value: "Pilgrim Street" },
    { label: "Devotion Lane", value: "Devotion Lane" }
  ],
  "Sabang": [
    { label: "Sabang Street", value: "Sabang Street" },
    { label: "Coastal Road", value: "Coastal Road" },
    { label: "Beach Avenue", value: "Beach Avenue" },
    { label: "Shore Drive", value: "Shore Drive" }
  ],
  "San Felipe": [
    { label: "San Felipe Street", value: "San Felipe Street" },
    { label: "Km. 5 Road", value: "Km. 5 Road" },
    { label: "Saint Street", value: "Saint Street" },
    { label: "Felipe Avenue", value: "Felipe Avenue" }
  ],
  "San Francisco": [
    { label: "San Francisco Avenue", value: "San Francisco Avenue" },
    { label: "Francis Street", value: "Francis Street" },
    { label: "Saint Road", value: "Saint Road" },
    { label: "Mission Lane", value: "Mission Lane" }
  ],
  "San Isidro": [
    { label: "San Isidro Street", value: "San Isidro Street" },
    { label: "Farmer's Road", value: "Farmer's Road" },
    { label: "Harvest Avenue", value: "Harvest Avenue" },
    { label: "Agricultural Street", value: "Agricultural Street" }
  ],
  "Santa Cruz": [
    { label: "Santa Cruz Avenue", value: "Santa Cruz Avenue" },
    { label: "Cross Street", value: "Cross Street" },
    { label: "Holy Road", value: "Holy Road" },
    { label: "Sacred Lane", value: "Sacred Lane" }
  ],
  "Tabuco": [
    { label: "Tabuco Street", value: "Tabuco Street" },
    { label: "Terminal Road", value: "Terminal Road" },
    { label: "Transport Avenue", value: "Transport Avenue" },
    { label: "Station Street", value: "Station Street" }
  ],
  "Triangulo": [
    { label: "Triangulo Street", value: "Triangulo Street" },
    { label: "Junction Road", value: "Junction Road" },
    { label: "Corner Avenue", value: "Corner Avenue" },
    { label: "Triangle Street", value: "Triangle Street" }
  ]
};

// Helper function to get street options based on barangay
export const getStreetOptions = (barangay) => {
  return streetsByBarangay[barangay] || [];
};

// Combined address options (Barangay - Street)
export const addressOptions = [];

// Generate combined address options
Object.keys(streetsByBarangay).forEach(barangay => {
  streetsByBarangay[barangay].forEach(street => {
    addressOptions.push({
      label: `${barangay} - ${street.value}`,
      value: `${barangay}|${street.value}`, // Using | as separator
      barangay: barangay,
      street: street.value
    });
  });
});

// Initial form data structure
export const initialFormData = {
  fullName: "",
  highestEducation: "",
  age: "",
  civilStatus: "",
  contactNo: "",
  address: "", // Combined address field
  mailingAddress: "",
  spouseName: "",
  spouseAge: "",
  spouseEducation: "",
  spouseOccupation: "",
  childrenNames: "",
  businessType: "",
  capitalization: "",
  capitalSource: "",
  previousExperience: "",
  relativeStallOwner: "",
  applicantSignature: "",
  houseLocation: "",
};

export interface CobrandPartner {
  id: string;
  name: string;
  logoText: string;
  color: string;
}

export const COBRAND_PARTNERS: CobrandPartner[] = [
  {
    id: "jarir",
    name: "Jarir Bookstore",
    logoText: "Jarir",
    color: "#2560D1"
  },
  {
    id: "amazon",
    name: "Amazon Saudi Arabia",
    logoText: "Amazon",
    color: "#FF9900"
  },
  {
    id: "extra",
    name: "eXtra Electronics",
    logoText: "eXtra",
    color: "#E03E36"
  },
  {
    id: "carrefour",
    name: "Carrefour",
    logoText: "Carrefour",
    color: "#2560D1"
  },
  {
    id: "panda",
    name: "Panda Retail",
    logoText: "Panda",
    color: "#43A047"
  },
  {
    id: "danube-hypermarket",
    name: "Danube Hypermarket",
    logoText: "Danube",
    color: "#E91E63"
  },
  {
    id: "ikea",
    name: "IKEA Saudi Arabia",
    logoText: "IKEA",
    color: "#0051BA"
  },
  {
    id: "danube-supermarket",
    name: "Danube Supermarket",
    logoText: "Danube",
    color: "#008B48"
  },
  {
    id: "none",
    name: "No Partner",
    logoText: "None",
    color: "#666666"
  }
];

export const getCobrandPartner = (partnerId: string | undefined): CobrandPartner => {
  // If partnerId is undefined or empty string, return the "none" partner
  if (!partnerId) return COBRAND_PARTNERS.find(p => p.id === "none") as CobrandPartner;
  
  // Otherwise find the partner by ID
  const partner = COBRAND_PARTNERS.find(p => p.id === partnerId);
  
  // Return the found partner or the "none" partner if not found
  return partner || (COBRAND_PARTNERS.find(p => p.id === "none") as CobrandPartner);
};

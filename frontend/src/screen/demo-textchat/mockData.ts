export interface TableData {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  membershipType?: string;
  pendingBalance?: string;
}
export const mockData: Array<TableData> = [
  {
    id: "4555",
    name: "John Doe",
    email: "john@gmail.com",
    phone: "123-456-7890",
    membershipType: "Gold",
    pendingBalance: "$3000",
  },
  {
    // Demo showing 2 different John Doe's
    id: "2345",
    name: "John Doe",
    email: "jane@gmail.com",
    phone: "555-444-1111",
    membershipType: "Silver",
    pendingBalance: "$2000",
  },
  {
    id: "3777",
    name: "Bob Smith",
    email: "bob123@gmail.com",
    phone: "555-333-2222",
    membershipType: "Bronze",
    pendingBalance: "$1000",
  },
];

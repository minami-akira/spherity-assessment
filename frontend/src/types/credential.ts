export interface VerifiableCredential {
  '@context': string[];
  id: string;
  type: string[];
  issuer: string;
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: {
    id?: string;
    [key: string]: unknown;
  };
}

export interface StoredCredential {
  id: string;
  credential: VerifiableCredential;
  jwt: string;
  createdAt: string;
}

export interface VerificationResult {
  valid: boolean;
  credential?: VerifiableCredential;
  error?: string;
}

export interface CreateCredentialPayload {
  type: string;
  claims: Record<string, unknown>;
  holderName?: string;
}

// Field configuration for form rendering
export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'email' | 'number';
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

// Predefined credential types for the form
export interface CredentialTemplate {
  type: string;
  label: string;
  icon: string;
  fields: FieldConfig[];
}

export const CREDENTIAL_TEMPLATES: CredentialTemplate[] = [
  {
    type: 'GymMembership',
    label: 'Gym Membership',
    icon: '🏋️',
    fields: [
      {
        name: 'memberName',
        label: 'Member Name',
        type: 'text',
        placeholder: 'John Doe',
        required: true,
      },
      {
        name: 'membershipType',
        label: 'Membership Type',
        type: 'select',
        options: ['Basic', 'Standard', 'Premium', 'VIP', 'Family'],
        required: true,
      },
      {
        name: 'validUntil',
        label: 'Valid Until',
        type: 'date',
        required: true,
      },
    ],
  },
  {
    type: 'EmployeeID',
    label: 'Employee ID',
    icon: '💼',
    fields: [
      {
        name: 'employeeName',
        label: 'Employee Name',
        type: 'text',
        placeholder: 'Jane Smith',
        required: true,
      },
      {
        name: 'department',
        label: 'Department',
        type: 'select',
        options: [
          'Engineering',
          'Product',
          'Design',
          'Marketing',
          'Sales',
          'HR',
          'Finance',
          'Operations',
          'Legal',
          'Customer Support',
        ],
        required: true,
      },
      {
        name: 'employeeId',
        label: 'Employee ID',
        type: 'text',
        placeholder: 'EMP-001',
        required: true,
      },
      {
        name: 'startDate',
        label: 'Start Date',
        type: 'date',
        required: true,
      },
    ],
  },
  {
    type: 'Certificate',
    label: 'Certificate',
    icon: '📜',
    fields: [
      {
        name: 'holderName',
        label: 'Holder Name',
        type: 'text',
        placeholder: 'John Doe',
        required: true,
      },
      {
        name: 'courseName',
        label: 'Course Name',
        type: 'select',
        options: [
          'Web Development Bootcamp',
          'Data Science Fundamentals',
          'Cloud Architecture',
          'Cybersecurity Essentials',
          'Project Management Professional',
          'Agile Scrum Master',
          'Machine Learning Basics',
          'Blockchain Development',
          'Other',
        ],
        required: true,
      },
      {
        name: 'grade',
        label: 'Grade',
        type: 'select',
        options: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'Pass'],
        required: true,
      },
      {
        name: 'completionDate',
        label: 'Completion Date',
        type: 'date',
        required: true,
      },
    ],
  },
  {
    type: 'Custom',
    label: 'Custom Credential',
    icon: '✏️',
    fields: [],
  },
];

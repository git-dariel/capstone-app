import React, { useState } from "react";
import { FormField, FormSelect } from "@/components/atoms";
import { Button } from "@/components/ui";
import type { InventoryFormData } from "@/services/inventory.service";

interface InventoryFormProps {
  studentId: string;
  onSubmit: (data: InventoryFormData) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

const educationLevelOptions = [
  { value: "pre_elementary", label: "Pre-Elementary" },
  { value: "elementary", label: "Elementary" },
  { value: "high_school", label: "High School" },
  { value: "vocational", label: "Vocational" },
  { value: "college_if_any", label: "College (if any)" },
];

const schoolStatusOptions = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
];

const educationalAttainmentOptions = [
  { value: "none", label: "None" },
  { value: "elementary", label: "Elementary" },
  { value: "high_school", label: "High School" },
  { value: "senior_high_school", label: "Senior High School" },
  { value: "bachelors_degree", label: "Bachelor's Degree" },
  { value: "vocational", label: "Vocational" },
];

const statusOptions = [
  { value: "living", label: "Living" },
  { value: "deceased", label: "Deceased" },
];

const relationshipOptions = [
  { value: "parent", label: "Parent" },
  { value: "child", label: "Child" },
  { value: "sibling", label: "Sibling" },
  { value: "spouse", label: "Spouse" },
  { value: "granparent", label: "Grandparent" },
  { value: "cousin", label: "Cousin" },
  { value: "partner", label: "Partner" },
  { value: "classmate", label: "Classmate" },
];

const parentalRelationshipOptions = [
  { value: "single_parent", label: "Single Parent" },
  { value: "married_and_staying_together", label: "Married and Staying Together" },
  { value: "married_but_separated", label: "Married but Separated" },
  { value: "not_married_but_living_together", label: "Not Married but Living Together" },
  { value: "others", label: "Others" },
];

const whoFinancesOptions = [
  { value: "parents", label: "Parents" },
  { value: "spouse", label: "Spouse" },
  { value: "relatives", label: "Relatives" },
  { value: "brother", label: "Brother" },
  { value: "sister", label: "Sister" },
  { value: "scholarship", label: "Scholarship" },
  { value: "self_supporting", label: "Self Supporting" },
];

const incomeOptions = [
  { value: "below_five_thousand", label: "Below ₱5,000" },
  { value: "five_thousand_to_ten_thousand", label: "₱5,000 - ₱10,000" },
  { value: "ten_thousand_to_fifteen_thousand", label: "₱10,000 - ₱15,000" },
  { value: "fifteen_thousand_to_twenty_thousand", label: "₱15,000 - ₱20,000" },
  { value: "twenty_thousand_to_twenty_five_thousand", label: "₱20,000 - ₱25,000" },
  { value: "twenty_five_thousand_to_thirty_thousand", label: "₱25,000 - ₱30,000" },
  { value: "thirty_thousand_to_thirty_five_thousand", label: "₱30,000 - ₱35,000" },
  { value: "thirty_five_thousand_to_forty_thousand", label: "₱35,000 - ₱40,000" },
  { value: "forty_thousand_to_forty_five_thousand", label: "₱40,000 - ₱45,000" },
  { value: "forty_five_thousand_to_fifty_thousand", label: "₱45,000 - ₱50,000" },
  { value: "above_fifty_thousand", label: "Above ₱50,000" },
];

const consultedOptions = [
  { value: "psychiatrist", label: "Psychiatrist" },
  { value: "psychologist", label: "Psychologist" },
  { value: "councelor", label: "Counselor" },
];

const yesNoOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const academicHobbiesOptions = [
  { value: "match_club", label: "Math Club" },
  { value: "debating_club", label: "Debating Club" },
  { value: "science_club", label: "Science Club" },
  { value: "quizzers_club", label: "Quizzers Club" },
];

const employedSiblingProvidingOptions = [
  { value: "family", label: "Family" },
  { value: "your_studies", label: "Your Studies" },
  { value: "his__or_her_own_family", label: "His/Her Own Family" },
];

const organizationsOptions = [
  { value: "athletics", label: "Athletics" },
  { value: "dramatics", label: "Dramatics" },
  { value: "religous_organization", label: "Religious Organization" },
  { value: "chess_club", label: "Chess Club" },
  { value: "glee_club", label: "Glee Club" },
  { value: "scouting", label: "Scouting" },
  { value: "others", label: "Others" },
];

const positionOptions = [
  { value: "officer", label: "Officer" },
  { value: "member", label: "Member" },
  { value: "others", label: "Others" },
];

const residenceOptions = [
  { value: "family_home", label: "Family Home" },
  { value: "relatives_home", label: "Relatives Home" },
  { value: "bed_spacer", label: "Bed Spacer" },
  { value: "rented_apartment", label: "Rented Apartment" },
  { value: "house_of_married_brother_or_sister", label: "House of Married Brother/Sister" },
  { value: "dorm", label: "Dormitory" },
  {
    value: "shares_apartment_with_friends_or_relatives",
    label: "Shared Apartment with Friends/Relatives",
  },
];

const ordinalPositionOptions = [
  { value: "1st child", label: "1st child" },
  { value: "2nd child", label: "2nd child" },
  { value: "3rd child", label: "3rd child" },
  { value: "4th child", label: "4th child" },
  { value: "5th child", label: "5th child" },
  { value: "6th child", label: "6th child" },
  { value: "7th child", label: "7th child" },
  { value: "8th child", label: "8th child" },
  { value: "9th child", label: "9th child" },
  { value: "10th child", label: "10th child" },
];

export const InventoryForm: React.FC<InventoryFormProps> = ({ studentId, onSubmit, loading = false, error }) => {
  const [formData, setFormData] = useState<InventoryFormData>({
    studentId,
    height: "",
    weight: "",
    coplexion: "",
    student_signature: "",
    person_to_be_contacted_in_case_of_accident_or_illness: {
      firstName: "",
      lastName: "",
      middleName: "",
      address: {
        houseNo: undefined,
        street: "",
        province: "",
        city: "",
        barangay: "",
        zipCode: undefined,
        country: "Philippines",
      },
      relationship: "parent",
    },
    educational_background: {
      level: "high_school",
      school_graduation: "",
      school_address: {
        houseNo: undefined,
        street: "",
        province: "",
        city: "",
        barangay: "",
        zipCode: undefined,
        country: "Philippines",
      },
      status: "public",
      dates_of_attendance: new Date().toISOString(),
      honors_received: "",
    },
    nature_of_schooling: {
      continuous: true,
      interrupted: false,
      exaplain_why: null,
    },
    home_and_family_background: {
      father: {
        firstName: "",
        lastName: "",
        middleName: "",
        age: 0,
        status: "living",
        educational_attainment: "high_school",
        occupation: "",
        employer: {
          name: "",
          address: {
            houseNo: undefined,
            street: "",
            province: "",
            city: "",
            barangay: "",
            zipCode: undefined,
            country: "Philippines",
          },
        },
      },
      mother: {
        firstName: "",
        lastName: "",
        middleName: "",
        age: 0,
        status: "living",
        educational_attainment: "high_school",
        occupation: "",
        employer: {
          name: "",
          address: {
            houseNo: undefined,
            street: "",
            province: "",
            city: "",
            barangay: "",
            zipCode: undefined,
            country: "Philippines",
          },
        },
      },
      guardian: {
        firstName: "",
        lastName: "",
        middleName: "",
        age: 0,
        status: "living",
        educational_attainment: "high_school",
        occupation: "",
        employer: {
          name: "",
          address: {
            houseNo: undefined,
            street: "",
            province: "",
            city: "",
            barangay: "",
            zipCode: undefined,
            country: "Philippines",
          },
        },
      },
      parents_martial_relationship: "married_and_staying_together",
      number_of_children_in_the_family_including_yourself: 0,
      number_of_brothers: 0,
      number_of_sisters: 0,
      number_of_brothers_or_sisters_employed: 0,
      ordinal_position: "1st child",
      is_your_brother_sister_who_is_gainfully_employed_providing_support_to_your: "family",
      who_finances_your_schooling: "parents",
      how_much_is_your_weekly_allowance: 0,
      parents_total_montly_income: {
        income: "below_five_thousand",
        others: "",
      },
      do_you_have_quiet_place_to_study: "yes",
      do_you_share_your_room_with_anyone: {
        status: "no",
        if_yes_with_whom: null,
      },
      nature_of_residence_while_attending_school: "family_home",
    },
    health: {
      physical: {
        your_vision: false,
        your_hearing: false,
        your_speech: false,
        your_general_health: false,
        if_yes_please_specify: "",
      },
      psychological: {
        consulted: "psychologist",
        status: "no",
        when: null,
        for_what: "",
      },
    },
    interest_and_hobbies: {
      academic: "science_club",
      favorite_subject: "",
      favorite_least_subject: "",
      what_are_your_hobbies: [],
      organizations_participated: "athletics",
      occupational_position_organization: "member",
    },
    test_results: {
      date: null,
      name_of_test: "",
      rs: "",
      pr: "",
      description: "",
    },
  });

  const handleFieldChange = (field: string, value: any) => {
    if (field.includes(".")) {
      const keys = field.split(".");
      setFormData((prev) => {
        const newData = { ...prev };
        let current: any = newData;

        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;
        return newData;
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleHobbiesChange = (hobby: string) => {
    setFormData((prev) => {
      const currentHobbies = prev.interest_and_hobbies?.what_are_your_hobbies || [];
      const newHobbies = currentHobbies.includes(hobby)
        ? currentHobbies.filter((h) => h !== hobby)
        : [...currentHobbies, hobby];

      return {
        ...prev,
        interest_and_hobbies: {
          ...prev.interest_and_hobbies,
          what_are_your_hobbies: newHobbies,
        },
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    try {
      // Sanitize data before submission - convert empty strings to null for DateTime fields
      const sanitizedFormData = {
        ...formData,
        health: {
          ...formData.health,
          psychological: {
            ...formData.health.psychological,
            when: formData.health.psychological.when === "" ? null : formData.health.psychological.when,
          },
        },
        test_results: formData.test_results
          ? {
              ...formData.test_results,
              date: formData.test_results.date === "" ? null : formData.test_results.date,
            }
          : undefined,
      };

      await onSubmit(sanitizedFormData);
    } catch (err) {
      console.error("Form submission error:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Basic Information */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Physical Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            id="height"
            label="Height *"
            type="text"
            value={formData.height}
            onChange={(e) => handleFieldChange("height", e.target.value)}
            required
            disabled={loading}
            placeholder="e.g., 5'8&quot;"
          />
          <FormField
            id="weight"
            label="Weight *"
            type="text"
            value={formData.weight}
            onChange={(e) => handleFieldChange("weight", e.target.value)}
            required
            disabled={loading}
            placeholder="e.g., 150 lbs"
          />
          <FormField
            id="coplexion"
            label="Complexion *"
            type="text"
            value={formData.coplexion}
            onChange={(e) => handleFieldChange("coplexion", e.target.value)}
            required
            disabled={loading}
            placeholder="e.g., Fair, Medium, Dark"
          />
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <FormField
            id="emergency_firstName"
            label="First Name *"
            type="text"
            value={formData.person_to_be_contacted_in_case_of_accident_or_illness.firstName}
            onChange={(e) =>
              handleFieldChange("person_to_be_contacted_in_case_of_accident_or_illness.firstName", e.target.value)
            }
            required
            disabled={loading}
          />
          <FormField
            id="emergency_lastName"
            label="Last Name *"
            type="text"
            value={formData.person_to_be_contacted_in_case_of_accident_or_illness.lastName}
            onChange={(e) =>
              handleFieldChange("person_to_be_contacted_in_case_of_accident_or_illness.lastName", e.target.value)
            }
            required
            disabled={loading}
          />
          <FormField
            id="emergency_middleName"
            label="Middle Name"
            type="text"
            value={formData.person_to_be_contacted_in_case_of_accident_or_illness.middleName || ""}
            onChange={(e) =>
              handleFieldChange("person_to_be_contacted_in_case_of_accident_or_illness.middleName", e.target.value)
            }
            disabled={loading}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <FormSelect
            id="emergency_relationship"
            label="Relationship *"
            value={formData.person_to_be_contacted_in_case_of_accident_or_illness.relationship}
            onChange={(value) =>
              handleFieldChange("person_to_be_contacted_in_case_of_accident_or_illness.relationship", value)
            }
            options={relationshipOptions}
            required
            disabled={loading}
          />
          <FormField
            id="emergency_street"
            label="Street"
            type="text"
            value={formData.person_to_be_contacted_in_case_of_accident_or_illness.address.street || ""}
            onChange={(e) =>
              handleFieldChange("person_to_be_contacted_in_case_of_accident_or_illness.address.street", e.target.value)
            }
            disabled={loading}
          />
          <FormField
            id="emergency_barangay"
            label="Barangay"
            type="text"
            value={formData.person_to_be_contacted_in_case_of_accident_or_illness.address.barangay || ""}
            onChange={(e) =>
              handleFieldChange(
                "person_to_be_contacted_in_case_of_accident_or_illness.address.barangay",
                e.target.value
              )
            }
            disabled={loading}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            id="emergency_city"
            label="City"
            type="text"
            value={formData.person_to_be_contacted_in_case_of_accident_or_illness.address.city || ""}
            onChange={(e) =>
              handleFieldChange("person_to_be_contacted_in_case_of_accident_or_illness.address.city", e.target.value)
            }
            disabled={loading}
          />
          <FormField
            id="emergency_province"
            label="Province"
            type="text"
            value={formData.person_to_be_contacted_in_case_of_accident_or_illness.address.province || ""}
            onChange={(e) =>
              handleFieldChange(
                "person_to_be_contacted_in_case_of_accident_or_illness.address.province",
                e.target.value
              )
            }
            disabled={loading}
          />
          <FormField
            id="emergency_zipCode"
            label="Zip Code"
            type="number"
            value={formData.person_to_be_contacted_in_case_of_accident_or_illness.address.zipCode?.toString() || ""}
            onChange={(e) =>
              handleFieldChange(
                "person_to_be_contacted_in_case_of_accident_or_illness.address.zipCode",
                parseInt(e.target.value) || undefined
              )
            }
            disabled={loading}
          />
        </div>
      </div>

      {/* Educational Background */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Educational Background of Student</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <FormSelect
            id="education_level"
            label="Education Level *"
            value={formData.educational_background.level}
            onChange={(value) => handleFieldChange("educational_background.level", value)}
            options={educationLevelOptions}
            required
            disabled={loading}
          />
          <FormField
            id="school_graduation"
            label="School/Graduation *"
            type="text"
            value={formData.educational_background.school_graduation}
            onChange={(e) => handleFieldChange("educational_background.school_graduation", e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <FormSelect
            id="school_status"
            label="School Status *"
            value={formData.educational_background.status}
            onChange={(value) => handleFieldChange("educational_background.status", value)}
            options={schoolStatusOptions}
            required
            disabled={loading}
          />
          <FormField
            id="dates_of_attendance"
            label="Dates of Attendance *"
            type="date"
            value={formData.educational_background.dates_of_attendance.split("T")[0] || ""}
            onChange={(e) => {
              // Convert date to ISO datetime string
              const dateValue = e.target.value;
              const isoDateTime = dateValue ? new Date(dateValue).toISOString() : "";
              handleFieldChange("educational_background.dates_of_attendance", isoDateTime);
            }}
            required
            disabled={loading}
          />
        </div>

        <FormField
          id="honors_received"
          label="Honors Received"
          type="text"
          value={formData.educational_background.honors_received}
          onChange={(e) => handleFieldChange("educational_background.honors_received", e.target.value)}
          disabled={loading}
          placeholder="List any academic honors or awards"
        />

        <div className="mt-4">
          <h4 className="text-md font-medium text-gray-800 mb-3">Nature of Schooling</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="nature_of_schooling"
                value="continuous"
                checked={formData.nature_of_schooling.continuous}
                onChange={() => {
                  handleFieldChange("nature_of_schooling.continuous", true);
                  handleFieldChange("nature_of_schooling.interrupted", false);
                  handleFieldChange("nature_of_schooling.exaplain_why", null);
                }}
                disabled={loading}
                className="mr-2 w-4 h-4 text-primary-700 bg-gray-100 border-gray-300 focus:ring-primary-500"
              />
              Continuous
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="nature_of_schooling"
                value="interrupted"
                checked={formData.nature_of_schooling.interrupted}
                onChange={() => {
                  handleFieldChange("nature_of_schooling.continuous", false);
                  handleFieldChange("nature_of_schooling.interrupted", true);
                }}
                disabled={loading}
                className="mr-2 w-4 h-4 text-primary-700 bg-gray-100 border-gray-300 focus:ring-primary-500"
              />
              Interrupted
            </label>
          </div>
          {formData.nature_of_schooling.interrupted && (
            <FormField
              id="explain_why"
              label="If interrupted, explain why"
              type="textarea"
              value={formData.nature_of_schooling.exaplain_why || ""}
              onChange={(e) => handleFieldChange("nature_of_schooling.exaplain_why", e.target.value)}
              disabled={loading}
              className="mt-2"
            />
          )}
        </div>
      </div>

      {/* Family Background */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Home and Family Background</h3>

        {/* Father Information */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-md font-medium text-gray-800 mb-4">Father's Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <FormField
              id="father_firstName"
              label="First Name *"
              type="text"
              value={formData.home_and_family_background.father.firstName}
              onChange={(e) => handleFieldChange("home_and_family_background.father.firstName", e.target.value)}
              required
              disabled={loading}
            />
            <FormField
              id="father_lastName"
              label="Last Name *"
              type="text"
              value={formData.home_and_family_background.father.lastName}
              onChange={(e) => handleFieldChange("home_and_family_background.father.lastName", e.target.value)}
              required
              disabled={loading}
            />
            <FormField
              id="father_middleName"
              label="Middle Name"
              type="text"
              value={formData.home_and_family_background.father.middleName || ""}
              onChange={(e) => handleFieldChange("home_and_family_background.father.middleName", e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <FormField
              id="father_age"
              label="Age *"
              type="number"
              value={formData.home_and_family_background.father.age.toString()}
              onChange={(e) =>
                handleFieldChange("home_and_family_background.father.age", parseInt(e.target.value) || 0)
              }
              required
              disabled={loading}
            />
            <FormSelect
              id="father_status"
              label="Status *"
              value={formData.home_and_family_background.father.status}
              onChange={(value) => handleFieldChange("home_and_family_background.father.status", value)}
              options={statusOptions}
              required
              disabled={loading}
            />
            <FormSelect
              id="father_education"
              label="Educational Attainment *"
              value={formData.home_and_family_background.father.educational_attainment}
              onChange={(value) => handleFieldChange("home_and_family_background.father.educational_attainment", value)}
              options={educationalAttainmentOptions}
              required
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormField
              id="father_occupation"
              label="Occupation *"
              type="text"
              value={formData.home_and_family_background.father.occupation}
              onChange={(e) => handleFieldChange("home_and_family_background.father.occupation", e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="mb-2">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Employer Information</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormField
                id="father_employer_name"
                label="Company/Employer Name"
                type="text"
                value={formData.home_and_family_background.father.employer?.name || ""}
                onChange={(e) => handleFieldChange("home_and_family_background.father.employer.name", e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                id="father_employer_street"
                label="Street"
                type="text"
                value={formData.home_and_family_background.father.employer?.address?.street || ""}
                onChange={(e) =>
                  handleFieldChange("home_and_family_background.father.employer.address.street", e.target.value)
                }
                disabled={loading}
              />
              <FormField
                id="father_employer_city"
                label="City"
                type="text"
                value={formData.home_and_family_background.father.employer?.address?.city || ""}
                onChange={(e) =>
                  handleFieldChange("home_and_family_background.father.employer.address.city", e.target.value)
                }
                disabled={loading}
              />
              <FormField
                id="father_employer_province"
                label="Province"
                type="text"
                value={formData.home_and_family_background.father.employer?.address?.province || ""}
                onChange={(e) =>
                  handleFieldChange("home_and_family_background.father.employer.address.province", e.target.value)
                }
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Mother Information */}
        <div className="mb-8 p-4 bg-pink-50 rounded-lg">
          <h4 className="text-md font-medium text-gray-800 mb-4">Mother's Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <FormField
              id="mother_firstName"
              label="First Name *"
              type="text"
              value={formData.home_and_family_background.mother.firstName}
              onChange={(e) => handleFieldChange("home_and_family_background.mother.firstName", e.target.value)}
              required
              disabled={loading}
            />
            <FormField
              id="mother_lastName"
              label="Last Name *"
              type="text"
              value={formData.home_and_family_background.mother.lastName}
              onChange={(e) => handleFieldChange("home_and_family_background.mother.lastName", e.target.value)}
              required
              disabled={loading}
            />
            <FormField
              id="mother_middleName"
              label="Middle Name"
              type="text"
              value={formData.home_and_family_background.mother.middleName || ""}
              onChange={(e) => handleFieldChange("home_and_family_background.mother.middleName", e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <FormField
              id="mother_age"
              label="Age *"
              type="number"
              value={formData.home_and_family_background.mother.age.toString()}
              onChange={(e) =>
                handleFieldChange("home_and_family_background.mother.age", parseInt(e.target.value) || 0)
              }
              required
              disabled={loading}
            />
            <FormSelect
              id="mother_status"
              label="Status *"
              value={formData.home_and_family_background.mother.status}
              onChange={(value) => handleFieldChange("home_and_family_background.mother.status", value)}
              options={statusOptions}
              required
              disabled={loading}
            />
            <FormSelect
              id="mother_education"
              label="Educational Attainment *"
              value={formData.home_and_family_background.mother.educational_attainment}
              onChange={(value) => handleFieldChange("home_and_family_background.mother.educational_attainment", value)}
              options={educationalAttainmentOptions}
              required
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormField
              id="mother_occupation"
              label="Occupation *"
              type="text"
              value={formData.home_and_family_background.mother.occupation}
              onChange={(e) => handleFieldChange("home_and_family_background.mother.occupation", e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="mb-2">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Employer Information</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormField
                id="mother_employer_name"
                label="Company/Employer Name"
                type="text"
                value={formData.home_and_family_background.mother.employer?.name || ""}
                onChange={(e) => handleFieldChange("home_and_family_background.mother.employer.name", e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                id="mother_employer_street"
                label="Street"
                type="text"
                value={formData.home_and_family_background.mother.employer?.address?.street || ""}
                onChange={(e) =>
                  handleFieldChange("home_and_family_background.mother.employer.address.street", e.target.value)
                }
                disabled={loading}
              />
              <FormField
                id="mother_employer_city"
                label="City"
                type="text"
                value={formData.home_and_family_background.mother.employer?.address?.city || ""}
                onChange={(e) =>
                  handleFieldChange("home_and_family_background.mother.employer.address.city", e.target.value)
                }
                disabled={loading}
              />
              <FormField
                id="mother_employer_province"
                label="Province"
                type="text"
                value={formData.home_and_family_background.mother.employer?.address?.province || ""}
                onChange={(e) =>
                  handleFieldChange("home_and_family_background.mother.employer.address.province", e.target.value)
                }
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Guardian Information */}
        <div className="mb-8 p-4 bg-green-50 rounded-lg">
          <h4 className="text-md font-medium text-gray-800 mb-4">Guardian's Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <FormField
              id="guardian_firstName"
              label="First Name *"
              type="text"
              value={formData.home_and_family_background.guardian.firstName}
              onChange={(e) => handleFieldChange("home_and_family_background.guardian.firstName", e.target.value)}
              required
              disabled={loading}
            />
            <FormField
              id="guardian_lastName"
              label="Last Name *"
              type="text"
              value={formData.home_and_family_background.guardian.lastName}
              onChange={(e) => handleFieldChange("home_and_family_background.guardian.lastName", e.target.value)}
              required
              disabled={loading}
            />
            <FormField
              id="guardian_middleName"
              label="Middle Name"
              type="text"
              value={formData.home_and_family_background.guardian.middleName || ""}
              onChange={(e) => handleFieldChange("home_and_family_background.guardian.middleName", e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <FormField
              id="guardian_age"
              label="Age *"
              type="number"
              value={formData.home_and_family_background.guardian.age.toString()}
              onChange={(e) =>
                handleFieldChange("home_and_family_background.guardian.age", parseInt(e.target.value) || 0)
              }
              required
              disabled={loading}
            />
            <FormSelect
              id="guardian_status"
              label="Status *"
              value={formData.home_and_family_background.guardian.status}
              onChange={(value) => handleFieldChange("home_and_family_background.guardian.status", value)}
              options={statusOptions}
              required
              disabled={loading}
            />
            <FormSelect
              id="guardian_education"
              label="Educational Attainment *"
              value={formData.home_and_family_background.guardian.educational_attainment}
              onChange={(value) =>
                handleFieldChange("home_and_family_background.guardian.educational_attainment", value)
              }
              options={educationalAttainmentOptions}
              required
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormField
              id="guardian_occupation"
              label="Occupation *"
              type="text"
              value={formData.home_and_family_background.guardian.occupation}
              onChange={(e) => handleFieldChange("home_and_family_background.guardian.occupation", e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="mb-2">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Employer Information</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormField
                id="guardian_employer_name"
                label="Company/Employer Name"
                type="text"
                value={formData.home_and_family_background.guardian.employer?.name || ""}
                onChange={(e) => handleFieldChange("home_and_family_background.guardian.employer.name", e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                id="guardian_employer_street"
                label="Street"
                type="text"
                value={formData.home_and_family_background.guardian.employer?.address?.street || ""}
                onChange={(e) =>
                  handleFieldChange("home_and_family_background.guardian.employer.address.street", e.target.value)
                }
                disabled={loading}
              />
              <FormField
                id="guardian_employer_city"
                label="City"
                type="text"
                value={formData.home_and_family_background.guardian.employer?.address?.city || ""}
                onChange={(e) =>
                  handleFieldChange("home_and_family_background.guardian.employer.address.city", e.target.value)
                }
                disabled={loading}
              />
              <FormField
                id="guardian_employer_province"
                label="Province"
                type="text"
                value={formData.home_and_family_background.guardian.employer?.address?.province || ""}
                onChange={(e) =>
                  handleFieldChange("home_and_family_background.guardian.employer.address.province", e.target.value)
                }
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Family Relationships and Financial Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              id="parents_relationship"
              label="Parents' Marital Relationship *"
              value={
                formData.home_and_family_background?.parents_martial_relationship || "married_and_staying_together"
              }
              onChange={(value) => handleFieldChange("home_and_family_background.parents_martial_relationship", value)}
              options={parentalRelationshipOptions}
              required
              disabled={loading}
            />
            <FormSelect
              id="who_finances"
              label="Who finances your schooling? *"
              value={formData.home_and_family_background?.who_finances_your_schooling || "parents"}
              onChange={(value) => handleFieldChange("home_and_family_background.who_finances_your_schooling", value)}
              options={whoFinancesOptions}
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormField
              id="siblings_total"
              label="Total children in family (including yourself) *"
              type="number"
              value={
                formData.home_and_family_background?.number_of_children_in_the_family_including_yourself?.toString() ||
                "0"
              }
              onChange={(e) =>
                handleFieldChange(
                  "home_and_family_background.number_of_children_in_the_family_including_yourself",
                  parseInt(e.target.value) || 0
                )
              }
              required
              disabled={loading}
            />
            <FormField
              id="brothers"
              label="Number of brothers"
              type="number"
              value={formData.home_and_family_background?.number_of_brothers?.toString() || "0"}
              onChange={(e) =>
                handleFieldChange("home_and_family_background.number_of_brothers", parseInt(e.target.value) || 0)
              }
              disabled={loading}
            />
            <FormField
              id="sisters"
              label="Number of sisters"
              type="number"
              value={formData.home_and_family_background?.number_of_sisters?.toString() || "0"}
              onChange={(e) =>
                handleFieldChange("home_and_family_background.number_of_sisters", parseInt(e.target.value) || 0)
              }
              disabled={loading}
            />
            <FormField
              id="employed_siblings"
              label="Employed brothers/sisters"
              type="number"
              value={formData.home_and_family_background?.number_of_brothers_or_sisters_employed?.toString() || "0"}
              onChange={(e) =>
                handleFieldChange(
                  "home_and_family_background.number_of_brothers_or_sisters_employed",
                  parseInt(e.target.value) || 0
                )
              }
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              id="ordinal_position"
              label="Ordinal Position *"
              value={formData.home_and_family_background?.ordinal_position || "1st child"}
              onChange={(value) => handleFieldChange("home_and_family_background.ordinal_position", value)}
              options={ordinalPositionOptions}
              required
              disabled={loading}
            />
            <FormSelect
              id="sibling_support"
              label="Employed sibling providing support to *"
              value={
                formData.home_and_family_background
                  ?.is_your_brother_sister_who_is_gainfully_employed_providing_support_to_your || "family"
              }
              onChange={(value) =>
                handleFieldChange(
                  "home_and_family_background.is_your_brother_sister_who_is_gainfully_employed_providing_support_to_your",
                  value
                )
              }
              options={employedSiblingProvidingOptions}
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormSelect
              id="family_income"
              label="Parents' total monthly income *"
              value={formData.home_and_family_background?.parents_total_montly_income?.income || "below_five_thousand"}
              onChange={(value) =>
                handleFieldChange("home_and_family_background.parents_total_montly_income.income", value)
              }
              options={incomeOptions}
              required
              disabled={loading}
            />
            <FormField
              id="income_others"
              label="Additional income sources"
              type="text"
              value={formData.home_and_family_background?.parents_total_montly_income?.others || ""}
              onChange={(e) =>
                handleFieldChange("home_and_family_background.parents_total_montly_income.others", e.target.value)
              }
              disabled={loading}
              placeholder="Other sources of income"
            />
            <FormField
              id="weekly_allowance"
              label="Weekly allowance (₱) *"
              type="number"
              value={formData.home_and_family_background?.how_much_is_your_weekly_allowance?.toString() || "0"}
              onChange={(e) =>
                handleFieldChange(
                  "home_and_family_background.how_much_is_your_weekly_allowance",
                  parseInt(e.target.value) || 0
                )
              }
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormSelect
              id="quiet_place"
              label="Do you have a quiet place to study? *"
              value={formData.home_and_family_background?.do_you_have_quiet_place_to_study || "yes"}
              onChange={(value) =>
                handleFieldChange("home_and_family_background.do_you_have_quiet_place_to_study", value)
              }
              options={yesNoOptions}
              required
              disabled={loading}
            />
            <FormSelect
              id="share_room"
              label="Do you share your room with anyone? *"
              value={formData.home_and_family_background?.do_you_share_your_room_with_anyone?.status || "no"}
              onChange={(value) =>
                handleFieldChange("home_and_family_background.do_you_share_your_room_with_anyone.status", value)
              }
              options={yesNoOptions}
              required
              disabled={loading}
            />
            <FormSelect
              id="residence_nature"
              label="Nature of residence while attending school *"
              value={formData.home_and_family_background?.nature_of_residence_while_attending_school || "family_home"}
              onChange={(value) =>
                handleFieldChange("home_and_family_background.nature_of_residence_while_attending_school", value)
              }
              options={residenceOptions}
              required
              disabled={loading}
            />
          </div>

          {formData.home_and_family_background?.do_you_share_your_room_with_anyone?.status === "yes" && (
            <FormField
              id="share_room_with_whom"
              label="If yes, with whom?"
              type="text"
              value={formData.home_and_family_background?.do_you_share_your_room_with_anyone?.if_yes_with_whom || ""}
              onChange={(e) =>
                handleFieldChange(
                  "home_and_family_background.do_you_share_your_room_with_anyone.if_yes_with_whom",
                  e.target.value
                )
              }
              disabled={loading}
              placeholder="Specify who you share your room with"
            />
          )}
        </div>
      </div>

      {/* Health and Wellness */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Health Information</h3>

        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-800 mb-3">Physical Health</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.health.physical.your_vision}
                onChange={(e) => handleFieldChange("health.physical.your_vision", e.target.checked)}
                disabled={loading}
                className="mr-2"
              />
              Vision problems
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.health.physical.your_hearing}
                onChange={(e) => handleFieldChange("health.physical.your_hearing", e.target.checked)}
                disabled={loading}
                className="mr-2"
              />
              Hearing problems
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.health.physical.your_speech}
                onChange={(e) => handleFieldChange("health.physical.your_speech", e.target.checked)}
                disabled={loading}
                className="mr-2"
              />
              Speech problems
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.health.physical.your_general_health}
                onChange={(e) => handleFieldChange("health.physical.your_general_health", e.target.checked)}
                disabled={loading}
                className="mr-2"
              />
              General health problems
            </label>
          </div>
          <FormField
            id="physical_specify"
            label="If yes, please specify"
            type="text"
            value={formData.health.physical.if_yes_please_specify || ""}
            onChange={(e) => handleFieldChange("health.physical.if_yes_please_specify", e.target.value)}
            disabled={loading}
            className="mt-4"
          />
        </div>

        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-800 mb-3">Psychological Health (Optional)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              id="psychological_consulted"
              label="Have you consulted a professional?"
              value={formData.health.psychological.consulted}
              onChange={(value) => handleFieldChange("health.psychological.consulted", value)}
              options={consultedOptions}
              disabled={loading}
            />
            <FormSelect
              id="psychological_status"
              label="Status"
              value={formData.health.psychological.status}
              onChange={(value) => handleFieldChange("health.psychological.status", value)}
              options={yesNoOptions}
              disabled={loading}
            />
            <FormField
              id="psychological_when"
              label="When?"
              type="date"
              value={formData.health.psychological.when ? formData.health.psychological.when.split("T")[0] : ""}
              onChange={(e) => {
                // Convert date to ISO datetime string or set to null
                const dateValue = e.target.value;
                const isoDateTime = dateValue ? new Date(dateValue).toISOString() : null;
                handleFieldChange("health.psychological.when", isoDateTime);
              }}
              disabled={loading}
            />
            <FormField
              id="psychological_for_what"
              label="For what?"
              type="text"
              value={formData.health.psychological.for_what || ""}
              onChange={(e) => handleFieldChange("health.psychological.for_what", e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Interest and Hobbies */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Interest and Hobbies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <FormSelect
            id="academic_interest"
            label="Academic Interest *"
            value={formData.interest_and_hobbies.academic || "science_club"}
            onChange={(value) => handleFieldChange("interest_and_hobbies.academic", value)}
            options={academicHobbiesOptions}
            required
            disabled={loading}
          />
          <FormField
            id="favorite_subject"
            label="Favorite Subject *"
            type="text"
            value={formData.interest_and_hobbies.favorite_subject || ""}
            onChange={(e) => handleFieldChange("interest_and_hobbies.favorite_subject", e.target.value)}
            required
            disabled={loading}
          />
          <FormField
            id="least_favorite_subject"
            label="Least Favorite Subject *"
            type="text"
            value={formData.interest_and_hobbies.favorite_least_subject || ""}
            onChange={(e) => handleFieldChange("interest_and_hobbies.favorite_least_subject", e.target.value)}
            required
            disabled={loading}
          />
          <FormSelect
            id="organizations"
            label="Organizations Participated *"
            value={formData.interest_and_hobbies.organizations_participated || "athletics"}
            onChange={(value) => handleFieldChange("interest_and_hobbies.organizations_participated", value)}
            options={organizationsOptions}
            required
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <FormSelect
            id="position_in_organization"
            label="Position in Organization *"
            value={formData.interest_and_hobbies.occupational_position_organization || "member"}
            onChange={(value) => handleFieldChange("interest_and_hobbies.occupational_position_organization", value)}
            options={positionOptions}
            required
            disabled={loading}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What are your hobbies? (Check all that apply)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {["Reading", "Swimming", "Gaming", "Music", "Sports", "Art", "Dancing", "Cooking"].map((hobby) => (
              <label key={hobby} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.interest_and_hobbies.what_are_your_hobbies?.includes(hobby) || false}
                  onChange={() => handleHobbiesChange(hobby)}
                  disabled={loading}
                  className="mr-2"
                />
                {hobby}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Test Results (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <FormField
            id="test_date"
            label="Test Date"
            type="date"
            value={formData.test_results?.date ? formData.test_results.date.split("T")[0] : ""}
            onChange={(e) => {
              // Convert date to ISO datetime string
              const dateValue = e.target.value;
              const isoDateTime = dateValue ? new Date(dateValue).toISOString() : null;
              handleFieldChange("test_results.date", isoDateTime);
            }}
            disabled={loading}
          />
          <FormField
            id="test_name"
            label="Name of Test"
            type="text"
            value={formData.test_results?.name_of_test || ""}
            onChange={(e) => handleFieldChange("test_results.name_of_test", e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <FormField
            id="test_rs"
            label="RS Score"
            type="text"
            value={formData.test_results?.rs || ""}
            onChange={(e) => handleFieldChange("test_results.rs", e.target.value)}
            disabled={loading}
          />
          <FormField
            id="test_pr"
            label="PR Score"
            type="text"
            value={formData.test_results?.pr || ""}
            onChange={(e) => handleFieldChange("test_results.pr", e.target.value)}
            disabled={loading}
          />
        </div>
        <FormField
          id="test_description"
          label="Description"
          type="textarea"
          value={formData.test_results?.description || ""}
          onChange={(e) => handleFieldChange("test_results.description", e.target.value)}
          disabled={loading}
        />
      </div>

      {/* Student Signature */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Signature</h3>

        <FormField
          id="student_signature"
          label="Student signature (type your full name) *"
          type="text"
          value={formData.student_signature}
          onChange={(e) => handleFieldChange("student_signature", e.target.value)}
          required
          disabled={loading}
          placeholder="Type your full name as your signature"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button
          type="submit"
          loading={loading}
          loadingText="Submitting..."
          variant="primary"
          disabled={loading}
          className="px-8 py-2"
        >
          Complete Inventory
        </Button>
      </div>
    </form>
  );
};

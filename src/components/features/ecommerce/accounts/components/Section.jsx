import React from "react";
import FieldDisplay from "./FieldDisplay";

const Section = ({ title, fields, user }) => {
  if (!fields || fields.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
        {title}
      </h3>

      <div className="grid gap-4">
        {fields.map((fieldKey) => (
          <FieldDisplay
            key={fieldKey}
            fieldKey={fieldKey}
            value={user[fieldKey]}
            user={user}
          />
        ))}
      </div>
    </div>
  );
};

export default Section;

import React from "react";

interface DynamicJsonLdProps {
  data: Record<string, any>;
}

export const DynamicJsonLd: React.FC<DynamicJsonLdProps> = ({ data }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

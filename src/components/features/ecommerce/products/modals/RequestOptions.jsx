import React, { useState } from "react";
import {
  X,
  Plus,
  Send,
  MessageSquare,
  Coffee,
  Clock,
  Star,
} from "lucide-react";

const RequestOptions = ({ isOpen, onClose, onSubmit }) => {
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  return <></>;
};

export default RequestOptions;

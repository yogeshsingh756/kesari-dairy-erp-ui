import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import VendorForm from "./VendorForm";

export default function VendorEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const vendorId = id ? parseInt(id) : undefined;

  const handleClose = () => {
    setOpen(false);
    navigate("/vendors");
  };

  const handleSuccess = () => {
    navigate("/vendors");
  };

  // If no valid ID, redirect to vendors list
  useEffect(() => {
    if (!vendorId) {
      navigate("/vendors");
    }
  }, [vendorId, navigate]);

  if (!vendorId) return null;

  return (
    <VendorForm
      open={open}
      onClose={handleClose}
      onSuccess={handleSuccess}
      vendorId={vendorId}
    />
  );
}

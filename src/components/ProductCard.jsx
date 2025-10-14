import React from "react"; 
import { Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  // Debugging: show the raw product object in console
  console.log("Product Data:", product);

  // Resolve the image source:
  // - If imageUrl is absolute (starts with http/https or //) use it
  // - If it's a relative filename, prefix with VITE_IMAGE_CDN_URL if provided
  // - Fallback to VITE_DEFAULT_IMAGE_PLACEHOLDER or an external placeholder
  const defaultPlaceholder = import.meta.env.VITE_DEFAULT_IMAGE_PLACEHOLDER || "https://via.placeholder.com/300";
  const cdnBase = import.meta.env.VITE_IMAGE_CDN_URL || "";

  let resolvedSrc = defaultPlaceholder;
  const rawImage = product?.imageUrl;
  if (rawImage) {
    const trimmed = String(rawImage).trim();
    if (/^(https?:)?\/\//i.test(trimmed)) {
      resolvedSrc = trimmed; // absolute URL or protocol-relative
    } else {
      // relative path or filename
      if (cdnBase) {
        // ensure single slash between parts
        resolvedSrc = `${cdnBase.replace(/\/$/, "")}/${trimmed.replace(/^\//, "")}`;
      } else {
        // serve relative to frontend public root
        resolvedSrc = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
      }
    }
  }
  console.debug("Resolved image src:", resolvedSrc);

  return (
    <Card
      className="h-100 border shadow-sm"
      onClick={() => {
        if (!product || !product.productId) {
          console.error("Product ID is undefined:", product);
          return;
        }
        navigate(`/product/${product.productId}`);
      }}
      style={{
        transition: "transform 0.3s ease-in-out",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <Card.Img
        variant="top"
        src={resolvedSrc}
        alt={product?.name || "Product Image"}
        style={{ height: "220px", objectFit: "cover" }}
      />
      <Card.Body className="text-center py-3">
        <Card.Title className="fs-6 mb-2">{product?.name || "Unknown"}</Card.Title>
        <Card.Text className="text-muted">₹{product?.price || "N/A"}</Card.Text>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;

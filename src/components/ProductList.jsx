import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Pagination } from "react-bootstrap";
import ProductCard from "./ProductCard";

const ProductList = ({ searchTerm, categoryId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prevProducts, setPrevProducts] = useState([]);
  const [fadeIn, setFadeIn] = useState(true);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8); // 8 items per page (2x4 grid)
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    // Reset to first page when search term or category changes
    setCurrentPage(1);
    
    setFadeIn(false);
    
    const timer = setTimeout(() => {
      setLoading(true);
      
      let url;
      
      if (searchTerm) {
        url = `http://localhost:8080/api/products/search/${searchTerm}`;
      } else if (categoryId) {
        url = `http://localhost:8080/api/products/category/${categoryId}`;
      } else {
        url = "http://localhost:8080/api/products";
      }
  
      axios
        .get(url)
        .then((response) => {
          setPrevProducts(products);
          setProducts(response.data);
          setTotalProducts(response.data.length);
          setLoading(false);
          setFadeIn(true);
        })
        .catch((error) => {
          console.error("Error fetching products:", error);
          setPrevProducts(products);
          setProducts([]);
          setTotalProducts(0);
          setLoading(false);
          setFadeIn(true);
        });
    }, 200);
    
    return () => clearTimeout(timer);
  }, [searchTerm, categoryId]);

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  // Get current items for display
  const displayProducts = loading ? prevProducts : products;
  const currentProducts = displayProducts.slice(indexOfFirstItem, indexOfLastItem);
  
  // Calculate total pages
  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Generate page numbers for pagination component
  const renderPaginationItems = () => {
    let items = [];
    
    // First button
    items.push(
      <Pagination.First 
        key="first"
        onClick={() => paginate(1)}
        disabled={currentPage === 1}
      />
    );

    // Previous button
    items.push(
      <Pagination.Prev 
        key="prev"
        onClick={() => paginate(currentPage - 1)}
        disabled={currentPage === 1}
      />
    );

    // Page numbers with ellipsis
    const pageNeighbours = 2;
    const left = Math.max(2, currentPage - pageNeighbours);
    const right = Math.min(totalPages - 1, currentPage + pageNeighbours);

    // Add first page
    items.push(
      <Pagination.Item
        key={1}
        active={1 === currentPage}
        onClick={() => paginate(1)}
      >
        {1}
      </Pagination.Item>
    );

    // Add left ellipsis if needed
    if (left > 2) {
      items.push(<Pagination.Ellipsis key="left-ellipsis" />);
    }

    // Add middle pages
    for (let number = left; number <= right; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => paginate(number)}
        >
          {number}
        </Pagination.Item>
      );
    }

    // Add right ellipsis if needed
    if (right < totalPages - 1) {
      items.push(<Pagination.Ellipsis key="right-ellipsis" />);
    }

    // Add last page if more than 1 page
    if (totalPages > 1) {
      items.push(
        <Pagination.Item
          key={totalPages}
          active={totalPages === currentPage}
          onClick={() => paginate(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }

    // Next button
    items.push(
      <Pagination.Next 
        key="next"
        onClick={() => paginate(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
    );

    // Last button
    items.push(
      <Pagination.Last 
        key="last"
        onClick={() => paginate(totalPages)}
        disabled={currentPage === totalPages}
      />
    );

    return items;
  };

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4 fw-bold">Trendy Outfits</h2>

      {/* Products Count */}
      {!loading && (
        <div className="mb-3 text-muted">
          Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalProducts)} of {totalProducts} products
        </div>
      )}

      <div className={`product-grid-container ${fadeIn ? 'fade-in' : 'fade-out'}`} style={{
        opacity: fadeIn ? 1 : 0.5,
        transition: 'opacity 0.3s ease-in-out'
      }}>
        {currentProducts.length > 0 ? (
          <Row xs={2} md={4} className="g-4">
            {currentProducts.map((product, index) => (
              <Col key={product.productId || index}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        ) : (
          <div className="text-center py-5">
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading products...</p>
              </div>
            ) : (
              <p>No products found.</p>
            )}
          </div>
        )}
      </div>

      {/* Pagination Component */}
      {totalPages > 1 && !loading && (
        <div className="d-flex justify-content-center mt-5">
          <Pagination>
            {renderPaginationItems()}
          </Pagination>
        </div>
      )}
    </Container>
  );
};

export default ProductList;
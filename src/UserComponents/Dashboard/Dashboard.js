import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card } from "react-bootstrap";
import { FaCashRegister, FaCreditCard, FaMobileAlt } from "react-icons/fa";
import "./Dashboard.css";
import { API_BASE_URL } from "../Config.js";

const Dashboard = () => {
  const [storeInfo, setStoreInfo] = useState({
    retailDue: 0,
    cash: 0,
    card: 0,
    upi: 0,
  });

  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        const user = JSON.parse(sessionStorage.getItem("user"));

        const response = await axios.get(`${API_BASE_URL}/store/storeInfo`, {
          params: { storeId: user.storeId },
        });
        setStoreInfo(response.data);
      } catch (error) {
        console.error("Error fetching store data", error);
      }
    };

    fetchStoreInfo();
  }, []);

  const cardData = [
    {
      title: "Cash",
      value: storeInfo.cash,
      icon: <FaCashRegister size={30} />,
      bgColor: "#42a5f5",
    },
    {
      title: "Card",
      value: storeInfo.card,
      icon: <FaCreditCard size={30} />,
      bgColor: "#66bb6a",
    },
    {
      title: "UPI",
      value: storeInfo.upi,
      icon: <FaMobileAlt size={30} />,
      bgColor: "#ffa726",
    },
    {
      title: "Retail Due",
      value: storeInfo.retailDue,
      icon: <FaCashRegister size={30} />,
      bgColor: "#ef5350",
    },
  ];

  return (
    <Container fluid className="dashboard-container">
      <Row className="g-4 justify-content-center">
        {cardData.map((card, index) => (
          <Col xs={12} sm={6} md={3} lg={3} key={index}>
            <Card className="custom-card border border-secondary" style={{ backgroundColor: card.bgColor }}>
              <Card.Body className="text-white text-center">
                <div className="icon">{card.icon}</div>
                <h5 className="card-title">{card.title}</h5>
                <h3 className="card-value">{card.value}</h3>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Dashboard;

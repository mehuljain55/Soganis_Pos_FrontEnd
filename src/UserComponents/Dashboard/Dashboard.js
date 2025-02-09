import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCashRegister, FaCreditCard,FaMoneyBillWave , FaMobileAlt } from "react-icons/fa";
import "./Dashboard.css";
import { API_BASE_URL } from "../Config.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faIndianRupeeSign } from "@fortawesome/free-solid-svg-icons";



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
      title: "Cash Collection",
      value: storeInfo.cash,
      icon: <FaCashRegister size={30} />,
      bgColor: "#42a5f5",
    },
    {
      title: "Card Collection",
      value: storeInfo.card,
      icon: <FaCreditCard size={30} />,
      bgColor: "#66bb6a",
    },
    {
      title: "UPI Collection",
      value: storeInfo.upi,
      icon: <FaMobileAlt size={30} />,
      bgColor: "#ffa726",
    },
    {
      title: "Retail Due",
      value: storeInfo.retailDue,
      icon: <FaCashRegister  />,
      bgColor: "#ef5350",
    },
    {
      title: "Opening Cash",
      value: storeInfo.openingCash,
      icon: <FontAwesomeIcon icon={faIndianRupeeSign} size={30} />,
      bgColor: "#ef5350",
    },
  ];

  return (
    <div className="dashboard-container">
      {/* First Row */}
      <div className="card-row">
        <div className="card-container" style={{ backgroundColor: cardData[0].bgColor }}>
          <div className="card-body text-center">
            <div className="icon">{cardData[0].icon}</div>
            <h5 className="card-title">{cardData[0].title}</h5>
            <h3 className="card-value">{cardData[0].value}</h3>
          </div>
        </div>

        <div className="card-container" style={{ backgroundColor: cardData[1].bgColor }}>
          <div className="card-body text-center">
            <div className="icon">{cardData[1].icon}</div>
            <h5 className="card-title">{cardData[1].title}</h5>
            <h3 className="card-value">{cardData[1].value}</h3>
          </div>
        </div>

        <div className="card-container" style={{ backgroundColor: cardData[1].bgColor }}>
          <div className="card-body text-center">
          <div className="icon" style={{ marginTop: "15px" }}>{cardData[4].icon}</div>
            <h5 className="card-title">{cardData[4].title}</h5>
            <h3 className="card-value">{cardData[4].value}</h3>
          </div>
        </div>


      </div>

      {/* Second Row */}
      <div className="card-row">
        <div className="card-container" style={{ backgroundColor: cardData[2].bgColor }}>
          <div className="card-body text-center">
            <div className="icon">{cardData[2].icon}</div>
            <h5 className="card-title">{cardData[2].title}</h5>
            <h3 className="card-value">{cardData[2].value}</h3>
          </div>
        </div>

        <div className="card-container" style={{ backgroundColor: cardData[3].bgColor }}>
          <div className="card-body text-center">
            <div className="icon">{cardData[3].icon}</div>
            <h5 className="card-title">{cardData[3].title}</h5>
            <h3 className="card-value">{cardData[3].value}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import {
  FaUserTie,
  FaWallet,
  FaCalendarAlt,
  FaPlaneDeparture
} from "react-icons/fa";

const EmpDashCards = ({ data }) => {
  const cardsData = [
    {
      title: "حالة الموظف",
      number: data?.employment_status || "غير محدد",
      icon: <FaUserTie size={25} />,
      color: "#0f766e"
    },
    {
      title: "صافي آخر راتب",
      number: data?.net_last_salary ? `${data.net_last_salary} شيكل` : "غير متوفر",
      subtitle: data?.net_last_salary ? "آخر قسيمة تم تحليلها" : "لا يوجد بيانات راتب",
      icon: <FaWallet size={25} />,
      color: "#f59e0b"
    },
    {
      title: "الأيام المتبقية من الإجازة السنوية",
      number: "---",
      progress: 0,
      subtitle: "قريباً",
      icon: <FaCalendarAlt size={25} />,
      color: "#3b82f6"
    },
    {
      title: "الإجازات المستخدمة",
      number: "---",
      subtitle: "قريباً",
      icon: <FaPlaneDeparture size={25} />,
      color: "#ef4444"
    },
  ];

  return (
    <Row className="g-4">
      {cardsData.map((card, index) => (
        <Col xs={12} sm={6} lg={3} key={index}>
          <Card
            style={{
              borderRadius: "12px",
              backgroundColor: "#f8f9fc",
              boxShadow: "0 4px 6px rgba(0,0,0,0.15)",
              border: "1px solid #e5e7eb",
              cursor: "pointer",
              transition: "transform 0.2s",
            }}
            className="h-100"
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.03)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
          >
            <Card.Body className="d-flex align-items-center">
              <div
                style={{
                  backgroundColor: card.color,
                  color: "white",
                  borderRadius: "50%",
                  width: "55px",
                  height: "55px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "15px",
                }}
              >
                {card.icon}
              </div>

              <div>
                <Card.Title className="mb-1 mx-2 mt-2 cardDashTitEmp">
                  {card.title}
                </Card.Title>
                <h4 className="mx-3 mt-2 cardDashNumEmp">
                  {card.number}
                </h4>

                {card.progress !== undefined && card.progress > 0 && (
                  <div className="mt-2 mx-2">
                    <div className="progress" style={{ height: "6px", borderRadius: "4px" }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${card.progress}%`, backgroundColor: card.color }}
                        aria-valuenow={card.progress}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                  </div>
                )}
                {card.subtitle && (
                  <small className="text-muted mx-3 subtitle">{card.subtitle}</small>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default EmpDashCards;

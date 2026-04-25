import { Card } from "react-bootstrap";
import UserAvatar from "./UserAvatar";

const ProfileHeader = ({ data }) => {
  const personal = data?.personal_info;
  return (
    <Card className="p-3 d-flex flex-column flex-sm-row align-items-center shadow-sm">
      <UserAvatar
        src={personal?.photo_url || "/images/employee-02.jpg"}
        name={personal?.full_name}
        size={70}
        className="ms-sm-3 mb-3 mb-sm-0"
      />
      <div className="text-center text-sm-end">
        <h6 style={{ margin: "5px 0", fontWeight: "bold" }}>
          {personal?.full_name || "---"}
        </h6>
        <small className="" style={{ color: "#6c757d" }}>
          {personal?.job_title || "---"} - وزارة الإقتصاد الوطني الفلسطيني
        </small>
      </div>
    </Card>
  );
};

export default ProfileHeader;
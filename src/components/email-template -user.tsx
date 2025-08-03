import * as React from "react";

interface EmailTemplateProps {
  firstName: string;
  serviceName?: string;
  bookingDate?: string | Date;
}

export const EmailTemplateUser: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
  serviceName = "your appointment",
  bookingDate,
}) => (
  <div
    style={{
      fontFamily: "Arial, sans-serif",
      lineHeight: "1.6",
      color: "#333",
    }}
  >
    <h2 style={{ color: "#2196F3" }}>New Booking Received</h2>
    <p>
      Hi <strong>{firstName}</strong>,
    </p>

    <p>
      You have a new booking for <strong>{serviceName}</strong>.
    </p>

    {bookingDate && (
      <p>
        <strong>Date & Time:</strong> {new Date(bookingDate).toLocaleString()}
      </p>
    )}

    <p>
      Please prepare accordingly. If you have any issues or need more details,
      contact the admin.
    </p>

    <p style={{ marginTop: "2rem" }}>
      Best regards, <br />
      <strong>MiniBooker System</strong>
    </p>
  </div>
);

export default EmailTemplateUser;

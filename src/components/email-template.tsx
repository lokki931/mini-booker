import * as React from "react";

interface EmailTemplateProps {
  firstName: string;
  serviceName?: string;
  bookingDate?: string | Date;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
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
    <h2 style={{ color: "#4CAF50" }}>Booking Confirmation</h2>
    <p>
      Hi <strong>{firstName}</strong>,
    </p>
    <p>
      Thank you for booking with us! This is a confirmation for{" "}
      <strong>{serviceName}</strong>.
    </p>

    {bookingDate && (
      <p>
        <strong>Date & Time:</strong> {new Date(bookingDate).toLocaleString()}
      </p>
    )}

    <p>
      If you have any questions or need to reschedule, feel free to contact us.
    </p>

    <p>We look forward to seeing you!</p>

    <p style={{ marginTop: "2rem" }}>
      Best regards, <br />
      <strong>MiniBooker Team</strong>
    </p>
  </div>
);

export default EmailTemplate;

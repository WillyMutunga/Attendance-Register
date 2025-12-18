const nodemailer = require('nodemailer');
const ical = require('ical-generator').default;

// Transporter Setup
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

/**
 * Send Calendar Invite
 */
const sendCalendarInvite = async (students, session) => {
    console.log("---------------------------------------------------");
    console.log("EMAIL SERVICE: Start");
    console.log("SMTP Config - User:", process.env.SMTP_USER ? 'Present' : 'Missing');
    console.log("SMTP Config - Pass:", process.env.SMTP_PASS ? 'Present' : 'Missing');
    console.log("Recipients Count:", students.length);

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn("EMAIL SERVICE: Credentials missing. Aborting.");
        return;
    }

    const startTime = new Date(session.startTime);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    const calendar = ical({ name: 'Class Schedule' });
    calendar.createEvent({
        start: startTime,
        end: endTime,
        summary: `${session.topic} - ${session.className}`,
        description: `Class session for ${session.className}. Link: ${session.meetingLink || 'No link provided'}`,
        location: session.meetingLink,
        url: session.meetingLink
    });

    for (const student of students) {
        console.log(`EMAIL SERVICE: Sending to ${student.email}`);
        const mailOptions = {
            from: `"Moringa Attendance" <${process.env.SMTP_USER}>`,
            to: student.email,
            subject: `Invitation: ${session.topic}`,
            text: `You have been invited to a class session: ${session.topic} at ${startTime.toLocaleString()}. Link: ${session.meetingLink}`,
            icalEvent: {
                method: 'REQUEST',
                content: calendar.toString()
            }
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log(`EMAIL SERVICE: Sent to ${student.email}. ID: ${info.messageId}`);
        } catch (error) {
            console.error(`EMAIL SERVICE: Error sending to ${student.email}:`, error);
        }
    }
    console.log("EMAIL SERVICE: End");
    console.log("---------------------------------------------------");
};

const sendEmail = async (to, subject, text) => {
    try {
        await transporter.sendMail({
            from: `"Moringa Attendance" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text
        });
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error("Email error:", error);
    }
};

module.exports = { sendCalendarInvite, sendEmail };

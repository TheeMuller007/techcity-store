import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendEmail = async (to, subject, html) => {
    // If no credentials, just log it
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log("--- EMAIL MOCK ---");
        console.log("To:", to);
        console.log("Subject:", subject);
        console.log("Body:", html);
        console.log("------------------");
        return { messageId: 'mock-id' };
    }

    try {
        const info = await transporter.sendMail({
            from: `"TechCity Zimbabwe" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
        console.log("Email sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        return null;
    }
};

export const getRegistrationEmail = (username) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #6366f1;">Welcome to TechCity!</h2>
            <p>Hi <strong>${username}</strong>,</p>
            <p>Thank you for registering with TechCity Zimbabwe. We're excited to have you on board!</p>
            <p>You can now explore our latest tech products, create a wishlist, and enjoy a seamless shopping experience.</p>
            <br>
            <a href="http://localhost:5000" style="background: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Start Shopping</a>
            <p style="margin-top: 30px; font-size: 0.8em; color: #777;">&copy; 2026 TechCity Zimbabwe. All rights reserved.</p>
        </div>
    `;
};

export const getOrderConfirmationEmail = (order, items) => {
    const itemsHtml = items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} x ${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #10b981;">Order Confirmed!</h2>
            <p>Thank you for your order, <strong>#ORD-${order.id}</strong>.</p>
            <p>We are processing your order and will notify you when it's on its way.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                    <tr style="background: #f9f9f9;">
                        <th style="padding: 10px; text-align: left;">Item</th>
                        <th style="padding: 10px; text-align: right;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
                <tfoot>
                    <tr>
                        <td style="padding: 10px; font-weight: bold;">Total</td>
                        <td style="padding: 10px; font-weight: bold; text-align: right;">$${parseFloat(order.total_price).toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>

            <p><strong>Shipping Address:</strong><br>
            ${order.shipping_address.fullName}<br>
            ${order.shipping_address.address}, ${order.shipping_address.city}</p>

            <p style="margin-top: 30px; font-size: 0.8em; color: #777;">&copy; 2026 TechCity Zimbabwe. All rights reserved.</p>
        </div>
    `;
};

export const getStatusUpdateEmail = (order, newStatus) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #3b82f6;">Order Update</h2>
            <p>Hi,</p>
            <p>Your order <strong>#ORD-${order.id}</strong> status has been updated to: <span style="font-weight: bold; color: #3b82f6;">${newStatus}</span>.</p>
            <p>You can track your order status in your dashboard.</p>
            <br>
            <a href="http://localhost:5000/dashboards/user/index.html" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Order</a>
            <p style="margin-top: 30px; font-size: 0.8em; color: #777;">&copy; 2026 TechCity Zimbabwe. All rights reserved.</p>
        </div>
    `;
};

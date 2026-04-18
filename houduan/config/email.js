const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: parseInt(process.env.EMAIL_PORT) === 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

let transporterVerified = false;
const verifyTransporter = async () => {
    if (transporterVerified) return;
    await transporter.verify();
    transporterVerified = true;
};

const supportEmail = process.env.SUPPORT_EMAIL || process.env.EMAIL_USER || '';
const fromName = process.env.EMAIL_FROM_NAME || '李嘉骏的火车站';

const buildMailHtml = (title, intro, code) => {
    return `
        <div style="padding: 24px; background-color: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;">
            <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.05);">
                <h2 style="color: #1d1d1f; font-size: 24px; font-weight: 600; margin-bottom: 24px; text-align: center;">${title}</h2>
                <p style="color: #424245; font-size: 16px; line-height: 1.5; text-align: center;">${intro}</p>
                <div style="background: #f5f5f7; border-radius: 12px; padding: 20px; margin: 32px 0; text-align: center;">
                    <span style="font-size: 36px; font-weight: 700; color: #0071e3; letter-spacing: 8px;">${code}</span>
                </div>
                <p style="color: #86868b; font-size: 13px; text-align: center;">该验证码 5 分钟内有效。如果这不是您本人操作，请立即检查账户安全。</p>
                <div style="border-top: 1px solid #f5f5f7; margin-top: 32px; padding-top: 24px; text-align: center;">
                    <p style="font-size: 12px; color: #b6b6b6; margin: 0;">此邮件由系统自动发出，请勿回复，如需要解决问题，可咨询:${supportEmail}。</p>
                </div>
            </div>
        </div>
    `;
};

async function sendVerifyCode(to, code) {
    await verifyTransporter();
    const mailOptions = {
        from: `"${fromName}" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: '李嘉骏的火车站 - 登录验证码',
        html: buildMailHtml('验证您的身份', '您好！您正在尝试登录管理后台。为了确保您的账户安全，请在验证框中输入以下验证码：', code)
    };

    return await transporter.sendMail(mailOptions);
}

async function sendRegisterVerifyCode(to, code) {
    await verifyTransporter();
    const mailOptions = {
        from: `"${fromName}" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: '安全验证 - 注册验证码',
        html: buildMailHtml('验证您的邮箱', '非常高兴您选择加入 “李嘉骏的火车站”！我是站长李嘉骏，代表本站全体工作人员（和虚拟的小火车们）向您致以最热烈的欢迎，为了确保您能顺利开启在本站的旅程，并保障您的账户安全，我们需要您完成邮箱验证。这是您的专属验证码：', code)
    };

    return await transporter.sendMail(mailOptions);
}

module.exports = { sendVerifyCode, sendRegisterVerifyCode };

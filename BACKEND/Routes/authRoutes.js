import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Forgot Password Email
router.post('/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Student.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Email not found' });

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await PasswordReset.deleteMany({ email });
    const reset = new PasswordReset({ email, code, expiresAt });
    await reset.save();

    const msg = {
      to: email,
      from: process.env.SENDGRID_VERIFIED_SENDER,
      subject: 'Etudoria Password Reset Code',
      text: `Your password reset code is: ${code}. It expires in 10 minutes.`,
    };
    await sgMail.send(msg);

    res.json({ message: 'Reset code sent to email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to send reset code' });
  }
});
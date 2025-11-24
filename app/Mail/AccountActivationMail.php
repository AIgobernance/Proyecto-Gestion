<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AccountActivationMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Datos del usuario transformados para el email
     */
    public array $userData;

    /**
     * URL de activación con token JWT
     */
    public string $activationUrl;

    /**
     * Create a new message instance.
     */
    public function __construct(array $userData, string $activationUrl)
    {
        $this->userData = $userData;
        $this->activationUrl = $activationUrl;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Bienvenido - Activa tu cuenta',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.account-activation',
            with: [
                'username' => $this->userData['username'] ?? '',
                'email' => $this->userData['email'] ?? '',
                'registrationDate' => $this->userData['registration_date'] ?? '',
                'registrationTime' => $this->userData['registration_time'] ?? '',
                'registrationDateTime' => $this->userData['registration_datetime'] ?? '',
                'company' => $this->userData['company'] ?? '',
                'activationUrl' => $this->activationUrl,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}

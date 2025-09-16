<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ReservationAcceptedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $reservation;
    public $booking;

    public function __construct($reservation, $booking)
    {
        $this->reservation = $reservation;
        $this->booking = $booking;
    }

    public function build()
    {
        return $this->subject('Your Reservation Has Been Accepted!')
                    ->view('emails.reservation_accepted')
                    ->with([
                        'reservation' => $this->reservation,
                        'booking' => $this->booking,
                    ]);
    }
}
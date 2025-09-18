<?php

namespace App\Mail;

use App\Models\Reservation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ReservationRejectedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $reservation;
    public $booking;


    public function __construct($reservation)
    {
        $this->reservation = $reservation;
    }

    public function build()
    {
        return $this->subject('Your Reservation Has Been Rejected')
                    ->view('emails.reservation_rejected')
                    ->with([
                        'reservation' => $this->reservation,
                    ]);;
    }
}

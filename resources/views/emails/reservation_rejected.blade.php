<!DOCTYPE html>
<html>
<head>
    <title>Reservation Rejected</title>
</head>
<body>
    <h2>Your Reservation Has Been Rejected!</h2>

    <p>Hello {{ $reservation->username }},</p>

    <p>We regret to inform you that your reservation has been rejected.</p>
    
    <h3>Reservation Details:</h3>
    <ul>
        <li><strong>Product:</strong> {{ $reservation->product_name }}</li>
        <li><strong>Quantity:</strong> {{ $reservation->quantity }}</li>
        <li><strong>Reservation Date:</strong> {{ $reservation->reserve_date }}</li>
        <li><strong>Reservation Time:</strong> {{ $reservation->reserve_time }}</li>
        <li><strong>Outlet:</strong> {{ $reservation->outlet }}</li>
    </ul>

    <p>If you have any questions, please contact us at 0123456789 or find us at KA100.</p>
    
    <p>Thank you for using our service!</p>
    
    <hr>
    <p><small>This is an automated message. Please do not reply to this email.</small></p>
</body>
</html>
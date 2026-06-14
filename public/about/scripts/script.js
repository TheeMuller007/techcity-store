
    <script>
        const cardData = [
            {
                img: 'https://via.placeholder.com/200?text=Image+1',
                title: 'Card 1',
                text: 'Information about the first part of our story.'
            },
            {
                img: 'https://via.placeholder.com/200?text=Image+2',
                title: 'Card 2',
                text: 'Details about our journey and achievements.'
            },
            {
                img: 'https://via.placeholder.com/200?text=Image+3',
                title: 'Card 3',
                text: 'Our vision for the future and what’s next.'
            },
            {
                img: 'https://via.placeholder.com/200?text=Image+4',
                title: 'Card 4',
                text: 'New innovations we are working on.'
            },
            {
                img: 'https://via.placeholder.com/200?text=Image+5',
                title: 'Card 5',
                text: 'Community engagement and support.'
            },
            {
                img: 'https://via.placeholder.com/200?text=Image+6',
                title: 'Card 6',
                text: 'Our commitment to sustainability.'
            }
        ];

        function getRandomCards(num) {
            const shuffled = cardData.sort(() => 0.5 - Math.random());
            return shuffled.slice(0, num);
        }

        function createCards(cards) {
            const container = document.getElementById('card-container');
            container.innerHTML = ''; // Clear previous cards
            cards.forEach(card => {
                const cardElement = document.createElement('div');
                cardElement.className = 'card';
                cardElement.innerHTML = `
                    <img src="${card.img}" alt="${card.title}">
                    <h2>${card.title}</h2>
                    <p>${card.text}</p>
                `;
                container.appendChild(cardElement);
            });
            // Activate the cards
            const activeCards = container.querySelectorAll('.card');
            activeCards.forEach(card => card.classList.add('active'));
        }

        function showNextCards() {
            const currentCards = document.querySelectorAll('.card');
            currentCards.forEach(card => card.classList.remove('active'));

            // Randomly select the next set of three cards
            const selectedCards = getRandomCards(3);
            createCards(selectedCards);
        }

        const initialCards = getRandomCards(3); // Get initial set of 3 cards
        createCards(initialCards);

        setInterval(showNextCards, 3000); // Change cards every 3 seconds
    </scriptt













    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Our Story</title>
    <style>
        body {
            font-family: sans-serif;
            background-color: #f4f4f4;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            overflow: hidden;
        }
        .container {
            display: flex;
            justify-content: space-between; /* Space between cards */
            width: 80%; /* Adjust width as needed */
        }
        .card {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 20px;
            width: 30%; /* Each card takes 30% of the container width */
            opacity: 0;
            transform: translateX(100%);
            animation: slide-out 1s forwards;
            position: relative;
            transition: opacity 1s;
        }
        .card img {
            width: 100%;
            border-radius: 8px 8px 0 0;
        }
        @keyframes slide-out {
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        /* Show the card */
        .active {
            opacity: 1;
            transform: translateX(0);
        }
    </style>
</head>
<body>
 

    <script>
        const cardData = [
            {
                img: 'https://via.placeholder.com/200?text=Image+1',
                title: 'Card 1',
                text: 'Information about the first part of our story.'
            },
            {
                img: 'https://via.placeholder.com/200?text=Image+2',
                title: 'Card 2',
                text: 'Details about our journey and achievements.'
            },
            {
                img: 'https://via.placeholder.com/200?text=Image+3',
                title: 'Card 3',
                text: 'Our vision for the future and what’s next.'
            },
            {
                img: 'https://via.placeholder.com/200?text=Image+4',
                title: 'Card 4',
                text: 'New innovations we are working on.'
            },
            {
                img: 'https://via.placeholder.com/200?text=Image+5',
                title: 'Card 5',
                text: 'Community engagement and support.'
            },
            {
                img: 'https://via.placeholder.com/200?text=Image+6',
                title: 'Card 6',
                text: 'Our commitment to sustainability.'
            }
        ];

        function getRandomCards(num) {
            const shuffled = cardData.sort(() => 0.5 - Math.random());
            return shuffled.slice(0, num);
        }

        function createCards(cards) {
            const container = document.getElementById('card-container');
            container.innerHTML = ''; // Clear previous cards
            cards.forEach(card => {
                const cardElement = document.createElement('div');
                cardElement.className = 'card';
                cardElement.innerHTML = `
                    <img src="${card.img}" alt="${card.title}">
                    <h2>${card.title}</h2>
                    <p>${card.text}</p>
                `;
                container.appendChild(cardElement);
            });
            // Activate the cards
            const activeCards = container.querySelectorAll('.card');
            activeCards.forEach(card => card.classList.add('active'));
        }

        function showNextCards() {
            const currentCards = document.querySelectorAll('.card');
            currentCards.forEach(card => card.classList.remove('active'));

            // Randomly select the next set of three cards
            const selectedCards = getRandomCards(3);
            createCards(selectedCards);
        }

        const initialCards = getRandomCards(3); // Get initial set of 3 cards
        createCards(initialCards);

        setInterval(showNextCards, 3000); // Change cards every 3 seconds
    </script>
</body>
</html>
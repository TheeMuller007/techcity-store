
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
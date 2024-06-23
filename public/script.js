document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ username, password })
        })
        .then(response => {
            if (response.ok) {
                document.getElementById('login').style.display = 'none';
                document.getElementById('artists').style.display = 'block';
                loadSongs();
            } else {
                alert('Invalid username or password');
            }
        })
        .catch(error => {
            console.error('Error logging in:', error);
        });
    });

    function loadSongs() {
        fetch('/api/songs')
            .then(response => response.json())
            .then(data => {
                const artistsContainer = document.getElementById('artists');
                artistsContainer.innerHTML = ''; // Clear previous content

                data.forEach(artistData => {
                    const artistContainer = document.createElement('div');
                    artistContainer.classList.add('artist');

                    const artistHeader = document.createElement('h2');
                    artistHeader.textContent = artistData.artist;
                    artistContainer.appendChild(artistHeader);

                    if (artistData.cover) {
                        const coverImage = document.createElement('img');
                        coverImage.src = artistData.cover;
                        coverImage.classList.add('cover');
                        artistContainer.appendChild(coverImage);
                    }

                    if (artistData.info) {
                        const infoText = document.createElement('p');
                        infoText.textContent = artistData.info.description;
                        artistContainer.appendChild(infoText);
                    }

                    artistData.songs.forEach(song => {
                        const songElement = document.createElement('div');
                        songElement.classList.add('song');

                        const songTitle = document.createElement('h3');
                        songTitle.textContent = song.title;
                        songElement.appendChild(songTitle);

                        const audioPlayer = document.createElement('audio');
                        audioPlayer.controls = true;
                        const source = document.createElement('source');
                        source.src = song.url;
                        source.type = 'audio/mp3';
                        audioPlayer.appendChild(source);
                        songElement.appendChild(audioPlayer);

                        artistContainer.appendChild(songElement);

                        // Add event listener to stop other players when a new one is played
                        audioPlayer.addEventListener('play', () => {
                            const allAudioPlayers = document.querySelectorAll('audio');
                            allAudioPlayers.forEach(player => {
                                if (player !== audioPlayer) {
                                    player.pause();
                                }
                            });
                        });
                    });

                    artistsContainer.appendChild(artistContainer);
                });
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }
});

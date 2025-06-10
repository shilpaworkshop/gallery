document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소 캐싱
    const detailModal = document.getElementById('detailModal');
    const closeButtons = document.querySelectorAll('.modal .close-button');
    const galleryContainer = document.querySelector('.gallery-container');
    const refreshGalleryBtn = document.getElementById('refreshGalleryBtn');

    // --- 갤러리 게시물 데이터 (페이지 새로고침 시 초기화됨) ---
    // 각 게시물은 고유한 ID, 미디어 타입, 제목, 내용, 미디어 URL, 주제, 추천수, 비추천수, 댓글을 가집니다.
    // 여기에 원하는 애니메이션, 책, 그림에 대한 게시물 데이터를 추가하세요!
    let posts = [
        {
            id: 'anime_001',
            type: 'image',
            title: '신비로운 숲의 여정',
            content: '아름다운 배경의 애니메이션 한 장면.',
            mediaUrl: 'media/anime_scene.jpg', // 실제 파일 경로로 교체 필요
            theme: '애니메이션',
            recommendations: 7,
            disrecommendations: 1,
            comments: [
                { author: '익명1', text: '정말 멋진 작품입니다!' },
                { author: '익명2', text: '이 애니메이션 제목이 뭔가요?' }
            ]
        },
        {
            id: 'book_001',
            type: 'image',
            title: '오래된 도시, 새로운 이야기',
            content: '흥미진진한 판타지 소설 표지.',
            mediaUrl: 'media/book_cover.png', // 실제 파일 경로로 교체 필요
            theme: '책 (소설)',
            recommendations: 11, // 베스트글 테스트용
            disrecommendations: 0,
            comments: [
                { author: '독서광', text: '이 책 너무 재미있어요!' }
            ]
        },
        {
            id: 'illust_001',
            type: 'gif',
            title: '움직이는 빛의 그림',
            content: '환상적인 분위기의 일러스트 GIF.',
            mediaUrl: 'media/illustration_art.gif', // 실제 파일 경로로 교체 필요
            theme: '그림 (일러스트)',
            recommendations: 4,
            disrecommendations: 2,
            comments: []
        },
        {
            id: 'anime_002',
            type: 'video',
            title: '미래 도시의 야경',
            content: 'SF 애니메이션 속 압도적인 도시 풍경.',
            mediaUrl: 'media/cyberpunk_city.mp4', // 예시, 실제 파일 경로로 교체 필요
            theme: '애니메이션',
            recommendations: 9,
            disrecommendations: 0,
            comments: []
        },
        {
            id: 'book_002',
            type: 'image',
            title: '모험의 시작',
            content: '어린이를 위한 동화책 삽화.',
            mediaUrl: 'media/kids_book.jpg', // 예시, 실제 파일 경로로 교체 필요
            theme: '책 (소설)',
            recommendations: 3,
            disrecommendations: 1,
            comments: []
        }
        // 더 많은 게시물을 여기에 추가할 수 있습니다.
        // { id: 'new_post_id', type: 'image'/'gif'/'video', title: '제목', content: '내용', mediaUrl: 'media/your_file.jpg', theme: '애니메이션'/'책 (소설)'/'그림 (일러스트)', recommendations: 0, disrecommendations: 0, comments: [] },
    ];

    let currentViewingPostId = null; // 현재 상세 모달에서 보고 있는 게시물의 ID

    // --- 페이지 로드 시 갤러리 초기화 및 렌더링 ---
    renderPosts();

    // --- 게시물 렌더링 함수 ---
    function renderPosts() {
        galleryContainer.innerHTML = ''; // 기존 게시물 모두 지우기

        // 추천수가 높은 순서로 정렬하여 베스트글이 상위에 노출되도록 함
        const sortedPosts = [...posts].sort((a, b) => b.recommendations - a.recommendations);

        sortedPosts.forEach(post => {
            const postItem = document.createElement('div');
            postItem.classList.add('gallery-item');
            // 추천수가 10 이상이면 'best-post' 클래스 추가
            if (post.recommendations >= 10) {
                postItem.classList.add('best-post');
            }
            postItem.dataset.postId = post.id; // 게시물 ID 저장

            let mediaHtml = '';
            if (post.type === 'image' || post.type === 'gif') {
                mediaHtml = `<img src="${post.mediaUrl}" alt="${post.title}">`;
            } else if (post.type === 'video') {
                mediaHtml = `<video src="${post.mediaUrl}" controls></video>`;
            }

            postItem.innerHTML = `
                ${mediaHtml}
                <div class="item-overlay">
                    <h3>${post.title}</h3>
                    <p>#${post.theme}</p>
                    <p>${post.content}</p>
                    <div class="actions">
                        <span class="recommend-count">추천: ${post.recommendations}</span>
                        <button class="recommend-btn">👍</button>
                        <span class="disrecommend-count">비추천: ${post.disrecommendations}</span>
                        <button class="disrecommend-btn">👎</button>
                    </div>
                </div>
                <div class="post-info">
                    <span class="author">작성자: ${post.author || '익명'}</span>
                    <span class="comments-count">댓글: ${post.comments.length}</span>
                </div>
            `;
            galleryContainer.appendChild(postItem);
        });

        // 새로 생성된 게시물들에 이벤트 리스너 다시 연결
        attachEventListenersToPosts();
    }

    // --- 게시물에 이벤트 리스너 연결 함수 ---
    function attachEventListenersToPosts() {
        document.querySelectorAll('.gallery-item').forEach(item => {
            // 상세 보기 모달 열기
            item.removeEventListener('click', openDetailModal); // 중복 방지
            item.addEventListener('click', openDetailModal);

            // 추천 버튼 이벤트
            const recommendBtn = item.querySelector('.recommend-btn');
            if (recommendBtn) {
                const oldRecommendListener = item.recommendListener;
                if (oldRecommendListener) recommendBtn.removeEventListener('click', oldRecommendListener);
                const newRecommendListener = (event) => handleRecommendation(event, item, 1);
                recommendBtn.addEventListener('click', newRecommendListener);
                item.recommendListener = newRecommendListener;
            }

            // 비추천 버튼 이벤트
            const disrecommendBtn = item.querySelector('.disrecommend-btn');
            if (disrecommendBtn) {
                const oldDisrecommendListener = item.disrecommendListener;
                if (oldDisrecommendListener) disrecommendBtn.removeEventListener('click', oldDisrecommendListener);
                const newDisrecommendListener = (event) => handleRecommendation(event, item, -1);
                disrecommendBtn.addEventListener('click', newDisrecommendListener);
                item.disrecommendListener = newDisrecommendListener;
            }
        });
    }

    // --- 상세 보기 모달 열기 함수 ---
    function openDetailModal(event) {
        // 추천/비추천 버튼 클릭 시 모달 열리지 않도록 이벤트 버블링 방지
        if (event.target.closest('.recommend-btn') || event.target.closest('.disrecommend-btn')) {
            return;
        }

        const item = event.currentTarget; // 클릭된 갤러리 아이템
        const postId = item.dataset.postId;
        currentViewingPostId = postId;

        const post = posts.find(p => p.id === postId);
        if (!post) return;

        const detailMediaDiv = document.getElementById('detailMedia');
        const detailTitle = document.getElementById('detailTitle');
        const detailTheme = document.getElementById('detailTheme');
        const detailContent = document.getElementById('detailContent');
        const detailRecommendCount = document.getElementById('detailRecommendCount');
        const detailDisrecommendCount = document.getElementById('detailDisrecommendCount');
        const detailRecommendBtn = document.getElementById('detailRecommendBtn');
        const detailDisrecommendBtn = document.getElementById('detailDisrecommendBtn');
        const commentsListElem = document.getElementById('commentsList');
        const commentForm = document.getElementById('commentForm');

        detailMediaDiv.innerHTML = ''; // 이전 미디어 내용 지우기

        if (post.type === 'image' || post.type === 'gif') {
            const img = document.createElement('img');
            img.src = post.mediaUrl;
            img.alt = post.title;
            detailMediaDiv.appendChild(img);
        } else if (post.type === 'video') {
            const video = document.createElement('video');
            video.src = post.mediaUrl;
            video.controls = true;
            detailMediaDiv.appendChild(video);
        }

        detailTitle.textContent = post.title;
        detailTheme.textContent = `주제: ${post.theme}`;
        detailContent.textContent = post.content;
        detailRecommendCount.textContent = `추천: ${post.recommendations}`;
        detailDisrecommendCount.textContent = `비추천: ${post.disrecommendations}`;

        // 상세 모달 내 추천/비추천 버튼 이벤트 리스너 연결
        detailRecommendBtn.onclick = (event) => {
            event.stopPropagation(); // 이벤트 버블링 방지
            handleRecommendation(event, item, 1);
            detailRecommendCount.textContent = `추천: ${post.recommendations}`; // 상세 모달에서도 즉시 업데이트
            detailDisrecommendCount.textContent = `비추천: ${post.disrecommendations}`;
        };

        detailDisrecommendBtn.onclick = (event) => {
            event.stopPropagation(); // 이벤트 버블링 방지
            handleRecommendation(event, item, -1);
            detailRecommendCount.textContent = `추천: ${post.recommendations}`; // 상세 모달에서도 즉시 업데이트
            detailDisrecommendCount.textContent = `비추천: ${post.disrecommendations}`;
        };

        // 댓글 목록 렌더링 (임시)
        commentsListElem.innerHTML = '';
        if (post.comments.length === 0) {
            commentsListElem.innerHTML = '<div style="color: #666; text-align: center;">아직 댓글이 없습니다.</div>';
        } else {
            post.comments.forEach(comment => {
                const commentDiv = document.createElement('div');
                commentDiv.classList.add('comment');
                commentDiv.innerHTML = `<span class="comment-author">${comment.author}</span>: ${comment.text}`;
                commentsListElem.appendChild(commentDiv);
            });
        }

        // 댓글 작성 폼 제출 이벤트 (임시)
        commentForm.onsubmit = (event) => {
            event.preventDefault();
            const commentText = commentForm.commentText.value.trim();
            if (commentText === '') {
                alert('댓글 내용을 입력해주세요.');
                return;
            }
            if (post) {
                const newComment = { author: '방문객', text: commentText };
                post.comments.push(newComment);
                const commentDiv = document.createElement('div');
                commentDiv.classList.add('comment');
                commentDiv.innerHTML = `<span class="comment-author">${newComment.author}</span>: ${newComment.text}`;
                commentsListElem.appendChild(commentDiv);

                // 메인 갤러리의 댓글 수도 업데이트
                const galleryItemElem = document.querySelector(`.gallery-item[data-post-id="${post.id}"] .comments-count`);
                if (galleryItemElem) {
                    galleryItemElem.textContent = `댓글: ${post.comments.length}`;
                }
                commentForm.reset();
                alert('댓글이 작성되었습니다! (페이지 새로고침 시 사라집니다.)');
            }
        };

        openModal(detailModal);
    }

    // --- 추천/비추천 핸들러 함수 ---
    function handleRecommendation(event, item, change) {
        event.stopPropagation(); // 갤러리 아이템 클릭 이벤트 방지

        const postId = item.dataset.postId;
        const post = posts.find(p => p.id === postId);

        if (post) {
            if (change === 1) { // 추천
                post.recommendations++;
            } else if (change === -1) { // 비추천
                post.disrecommendations++;
            }

            // DOM 요소의 추천/비추천 수 업데이트
            item.querySelector('.recommend-count').textContent = `추천: ${post.recommendations}`;
            item.querySelector('.disrecommend-count').textContent = `비추천: ${post.disrecommendations}`;

            // 베스트글 상태 업데이트 (클래스 추가/제거)
            if (post.recommendations >= 10) {
                item.classList.add('best-post');
            } else {
                item.classList.remove('best-post');
            }

            // 추천 수에 따라 정렬 순서가 바뀔 수 있으므로 전체 다시 렌더링
            renderPosts();
        }
    }

    // --- 모달 제어 함수 ---
    function openModal(modal) {
        modal.style.display = 'block';
    }

    function closeModal(modal) {
        modal.style.display = 'none';
        currentViewingPostId = null; // 모달 닫을 때 현재 게시물 ID 초기화
    }

    // 모든 닫기 버튼에 이벤트 리스너 연결
    closeButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            closeModal(event.target.closest('.modal'));
        });
    });

    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', (event) => {
        if (event.target === detailModal) closeModal(detailModal);
    });

    // --- 갤러리 새로고침 버튼 ---
    refreshGalleryBtn.addEventListener('click', () => {
        alert('갤러리를 새로고침합니다. (추천/비추천, 댓글 정보가 초기화됩니다.)');
        // 실제 데이터가 없으므로 posts 배열을 다시 초기화하고 렌더링
        // 이 버튼은 media 폴더의 변경사항을 실시간으로 감지하지 못합니다.
        // 새로운 미디어를 추가하려면 script.js의 posts 배열을 직접 수정해야 합니다.
        renderPosts();
    });
});
// Mettre à jour ces deux valeurs lorsqu’une nouvelle publication est en ligne.
// YouTube : identifiant à 11 caractères après v= ou dans le lien youtu.be.
// Instagram : lien public vers une publication ou un reel.
const latestYouTubeVideoId = "";
const latestInstagramPostUrl = "";

const youtubeCard = document.querySelector('[data-social="youtube"]');
if (youtubeCard && /^[\w-]{11}$/.test(latestYouTubeVideoId)) {
  const link = youtubeCard.querySelector("a");
  link.href = `https://www.youtube.com/watch?v=${latestYouTubeVideoId}`;
  link.textContent = "Regarder la dernière vidéo sur YouTube";

  const thumbnail = document.createElement("img");
  thumbnail.src = `https://i.ytimg.com/vi/${latestYouTubeVideoId}/hqdefault.jpg`;
  thumbnail.alt = "";
  thumbnail.loading = "lazy";
  thumbnail.className = "social-updates__preview";
  link.prepend(thumbnail);
}

const instagramCard = document.querySelector('[data-social="instagram"]');
const instagramPost = latestInstagramPostUrl.match(
  /^https:\/\/(?:www\.)?instagram\.com\/(p|reel)\/([\w-]+)\/?(?:[?#].*)?$/
);
if (instagramCard && instagramPost) {
  const postUrl = `https://www.instagram.com/${instagramPost[1]}/${instagramPost[2]}/`;
  const link = instagramCard.querySelector("a");
  link.href = postUrl;
  link.textContent = "Ouvrir la dernière publication sur Instagram";

  const preview = document.createElement("iframe");
  preview.src = `${postUrl}embed/`;
  preview.title = "Aperçu de la dernière publication Instagram";
  preview.loading = "lazy";
  preview.className = "social-updates__preview social-updates__preview--instagram";
  link.before(preview);
}

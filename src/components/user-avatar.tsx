export function UserAvatar({ url, name, size = 32 }: { url?: string | null; name: string; size?: number }) {
  const initials = name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: url ? "transparent" : "var(--color-border)",
        overflow: "hidden",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size > 28 ? "0.75rem" : "0.625rem",
        fontWeight: 600,
        color: "var(--color-text-secondary)",
      }}
    >
      {url ? (
        <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

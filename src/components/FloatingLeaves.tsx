const leaves = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  left: `${15 + i * 14}%`,
  delay: `${i * 1.3}s`,
  size: 12 + (i % 3) * 4,
}));

const FloatingLeaves = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    {leaves.map(leaf => (
      <div
        key={leaf.id}
        className="absolute bottom-0 animate-leaf-float opacity-30"
        style={{
          left: leaf.left,
          animationDelay: leaf.delay,
          animationDuration: `${7 + leaf.id}s`,
        }}
      >
        <svg width={leaf.size} height={leaf.size} viewBox="0 0 24 24" fill="none">
          <path
            d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75"
            stroke="hsl(152, 45%, 22%)"
            strokeWidth="1.5"
            fill="hsl(152, 45%, 22%)"
            fillOpacity="0.3"
          />
        </svg>
      </div>
    ))}
  </div>
);

export default FloatingLeaves;

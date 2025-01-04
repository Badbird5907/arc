export const twTypography = (["h1", "h2", "h3", "h4", "h5", "h6", "p", "ul", "ol", "li", "blockquote"]
							.reduce((acc: Record<string, object>, key) => {
							acc[key] = {
								marginTop: "0",
								marginBottom: "0",
							};
							return acc;
						}, {}));
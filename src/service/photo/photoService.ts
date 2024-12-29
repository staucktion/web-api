import sharp from "sharp";
import CustomError from "src/error/CustomError";

class PhotoService {
	public async addTextWatermark(
		inputPath: string,
		outputPath: string,
		watermarkText: string,
		fontSize: number,
		opacity: number
	): Promise<void> {
		try {
			const image = sharp(inputPath);
			const { width, height } = await image.metadata();
			const horizontalSpacing = 30;
			const verticalSpacing = 15;

			// calculate the text length and adjust position based on watermark
			const textLength = watermarkText.length * (fontSize / 2);

			// create the SVG markup for the watermark text
			const svgText = (x: number, y: number) => `
      <svg width="${width}" height="${height}">
        <style>
          .watermark {
            fill: rgba(255, 255, 255, ${opacity}); /* White text with opacity */
            font-size: ${fontSize}px;
            font-family: sans-serif;
            font-weight: bold;
          }
        </style>
        <text x="${x}" y="${y}" class="watermark" text-anchor="middle" alignment-baseline="middle">
          ${watermarkText}
        </text>
      </svg>
    `;

			// Handle repeating watermark
			const compositeInput: Array<any> = [];

			const horizontalCount = Math.ceil(
				Number(width) / (textLength + horizontalSpacing)
			);
			const verticalCount = Math.ceil(
				Number(height) / (fontSize + verticalSpacing)
			);

			for (let row = 0; row < verticalCount; row++) {
				for (let col = 0; col < horizontalCount; col++) {
					let x = col * (textLength + horizontalSpacing);
					if (row % 2 == 0) x += fontSize * 4;
					let y = row * (fontSize + verticalSpacing);
					compositeInput.push({
						input: Buffer.from(svgText(x, y)),
						left: x,
						top: y,
					});
				}
			}

			await image.composite(compositeInput).toFile(outputPath);
		} catch (error: any) {
			CustomError.builder()
				.setErrorType("Server Error")
				.setClassName(this.constructor.name)
				.setMethodName("addTextWatermark")
				.setError(error)
				.build()
				.throwError();
			console.error("Error adding watermark:", error);
			throw error;
		}
	}
}

export default PhotoService;

import Config from "src/config/Config";
import DbConfigDto from "src/dto/dbConfig/DbConfigDto";
import CustomError from "src/error/CustomError";
import DbConfigService from "src/service/dbConfig/DbConfigService";

class DbConfigFacade {
	private dbConfigService: DbConfigService;

	constructor() {
		this.dbConfigService = new DbConfigService();
	}

	public async getDbConfig(): Promise<DbConfigDto> {
		try {
			return await this.dbConfigService.fetchDbConfig();
		} catch (error) {
			CustomError.handleSystemError(error);
			return;
		}
	}

	public async setDbConfig(data: Omit<DbConfigDto, "id">): Promise<void> {
		try {
			await this.dbConfigService.setDbConfig(data);
		} catch (error) {
			CustomError.handleSystemError(error);
			return;
		}
	}

	public async syncDbConfig(): Promise<void> {
		try {
			// fetch configs from db
			const dbConfig: DbConfigDto = await this.dbConfigService.fetchDbConfig();
			// set db configs as static to use in app
			Config.voterComissionPercentage = dbConfig.voter_comission_percentage;
			Config.photographerComissionPercentage = dbConfig.photographer_comission_percentage;
			Config.isTimerActive = dbConfig.is_timer_job_active;
		} catch (error) {
			CustomError.handleSystemError(error);
			return;
		}
	}
}

export default DbConfigFacade;

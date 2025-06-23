package com.example.Doanlesg.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Class này dùng để tự động kiểm tra và tạo cơ sở dữ liệu (dành cho SQL Server)
 * khi ứng dụng khởi động nếu nó chưa tồn tại.
 */
public class DatabaseInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseInitializer.class);

    private final String mainDatasourceUrl;
    private final String username;
    private final String password;
    private final String driverClassName;

    public DatabaseInitializer(String mainDatasourceUrl, String username, String password, String driverClassName) {
        this.mainDatasourceUrl = mainDatasourceUrl;
        this.username = username;
        this.password = password;
        this.driverClassName = driverClassName;
    }

    /**
     * Phương thức chính để thực hiện việc kiểm tra và khởi tạo.
     */
    public void initialize() {
        String targetDbName;
        try {
            targetDbName = getDatabaseNameFromUrl(mainDatasourceUrl);
        } catch (IllegalArgumentException e) {
            logger.error("Không thể khởi tạo CSDL: Không xác định được tên CSDL từ URL '{}'. Vui lòng kiểm tra lại cấu hình 'spring.datasource.url'.", mainDatasourceUrl, e);
            throw new IllegalStateException("Không thể tiếp tục nếu không có tên CSDL hợp lệ từ URL: " + mainDatasourceUrl, e);
        }

        // Tạo URL kết nối đến database 'master' để có quyền tạo CSDL mới
        String masterUrl = getMasterDatasourceUrl(mainDatasourceUrl, targetDbName);

        logger.info("Đang kiểm tra sự tồn tại của CSDL '{}'...", targetDbName);

        DriverManagerDataSource masterDataSource = new DriverManagerDataSource();
        masterDataSource.setDriverClassName(this.driverClassName);
        masterDataSource.setUrl(masterUrl);
        masterDataSource.setUsername(this.username);
        masterDataSource.setPassword(this.password);

        JdbcTemplate jdbcTemplate = new JdbcTemplate(masterDataSource);

        // Câu lệnh SQL để kiểm tra sự tồn tại của database
        String checkDbExistsSql = "SELECT name FROM sys.databases WHERE name = N'" + targetDbName + "'";
        // Câu lệnh SQL để tạo database
        String createDbSql = "CREATE DATABASE [" + targetDbName + "]";

        try {
            // Thực hiện truy vấn. Nếu có kết quả, database đã tồn tại.
            jdbcTemplate.queryForObject(checkDbExistsSql, String.class);
            logger.info("CSDL '{}' đã tồn tại. Không cần thực hiện hành động nào.", targetDbName);
        } catch (EmptyResultDataAccessException e) {
            // Đây là trường hợp mong đợi nếu database CHƯA tồn tại.
            // Ngoại lệ EmptyResultDataAccessException được ném ra khi queryForObject không tìm thấy dòng nào.
            logger.info("CSDL '{}' chưa tồn tại. Bắt đầu quá trình tạo mới...", targetDbName);
            attemptDbCreation(jdbcTemplate, createDbSql, targetDbName);
        } catch (Exception ex) {
            // Bắt các lỗi khác có thể xảy ra (ví dụ: không có quyền, SQL server không truy cập được)
            logger.error("Lỗi trong quá trình kiểm tra hoặc tạo CSDL '{}': {}. Đảm bảo SQL Server đang hoạt động và người dùng '{}' có đủ quyền trên CSDL master.",
                    targetDbName, ex.getMessage(), this.username, ex);
            throw new RuntimeException("Lỗi nghiêm trọng khi khởi tạo CSDL: " + targetDbName, ex);
        }
    }

    /**
     * Thực hiện việc tạo CSDL và xử lý ngoại lệ.
     */
    private void attemptDbCreation(JdbcTemplate jdbcTemplate, String createDbSql, String targetDbName) {
        try {
            jdbcTemplate.execute(createDbSql);
            logger.info("Đã tạo thành công CSDL '{}'.", targetDbName);
        } catch (Exception createEx) {
            logger.error("Tạo CSDL '{}' thất bại. Người dùng: '{}'. Lỗi: {}",
                    targetDbName, this.username, createEx.getMessage(), createEx);
            throw new RuntimeException("Không thể tạo CSDL: " + targetDbName, createEx);
        }
    }

    /**
     * Trích xuất tên database từ chuỗi URL kết nối.
     * Ví dụ: từ "jdbc:sqlserver://localhost;databaseName=MyDb", nó sẽ lấy ra "MyDb".
     */
    private String getDatabaseNameFromUrl(String url) {
        // Sử dụng regex để tìm giá trị của 'databaseName' một cách linh hoạt, không phân biệt hoa thường
        Pattern pattern = Pattern.compile("databaseName=([^;]+)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(url);
        if (matcher.find()) {
            return matcher.group(1); // Group(1) là nội dung bên trong dấu ngoặc đơn của regex
        }
        throw new IllegalArgumentException("Không thể trích xuất databaseName từ URL: " + url);
    }

    /**
     * Thay đổi chuỗi URL kết nối để trỏ đến CSDL 'master'.
     */
    private String getMasterDatasourceUrl(String originalUrl, String targetDbName) {
        // Sử dụng regex để thay thế tên CSDL cũ bằng 'master', không phân biệt hoa thường
        Pattern pattern = Pattern.compile(
                Pattern.quote("databaseName=") + Pattern.quote(targetDbName),
                Pattern.CASE_INSENSITIVE
        );
        Matcher matcher = pattern.matcher(originalUrl);
        if (matcher.find()) {
            return matcher.replaceFirst("databaseName=master");
        }
        throw new IllegalArgumentException(
                "Không thể thay đổi URL để trỏ tới CSDL master. Không tìm thấy chuỗi 'databaseName=" + targetDbName + "' trong URL: " + originalUrl
        );
    }
}

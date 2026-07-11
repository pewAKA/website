package com.personalwebsite.backend.user;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface SysUserMapper {

    @Select("""
            SELECT id, username, password_hash, role, enabled, created_at, updated_at
            FROM sys_user
            WHERE username = #{username}
            LIMIT 1
            """)
    SysUser findByUsername(@Param("username") String username);

    @Insert("""
            INSERT INTO sys_user (username, password_hash, role, enabled)
            VALUES (#{user.username}, #{user.passwordHash}, #{user.role}, #{user.enabled})
            """)
    @Options(useGeneratedKeys = true, keyProperty = "user.id")
    int insert(@Param("user") SysUser user);
}


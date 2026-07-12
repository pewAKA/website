package com.personalwebsite.backend.user;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface SysUserMapper {

    @Select("""
            SELECT id, username, password_hash, role, enabled, token_version, created_at, updated_at
            FROM sys_user
            WHERE username = #{username}
            LIMIT 1
            """)
    SysUser findByUsername(@Param("username") String username);

    @Select("""
            SELECT id, username, password_hash, role, enabled, token_version, created_at, updated_at
            FROM sys_user
            WHERE id = #{id}
            LIMIT 1
            """)
    SysUser findById(@Param("id") long id);

    @Insert("""
            INSERT INTO sys_user (username, password_hash, role, enabled)
            VALUES (#{user.username}, #{user.passwordHash}, #{user.role}, #{user.enabled})
            """)
    @Options(useGeneratedKeys = true, keyProperty = "user.id")
    int insert(@Param("user") SysUser user);

    @Update("""
            UPDATE sys_user
            SET password_hash = #{passwordHash}, token_version = token_version + 1
            WHERE id = #{id} AND enabled = 1
            """)
    int updatePasswordAndIncrementTokenVersion(
            @Param("id") long id,
            @Param("passwordHash") String passwordHash
    );
}
